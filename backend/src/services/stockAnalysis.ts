import { getStockQuote, getStockTimeSeries, calculateIndicators } from './alphaVantage';
import { getYahooStockData } from './yahooFinance';
import { getFMPStockData } from './fmpService';
import { generateStockAnalysis, AnalysisResult } from './claudeService';
import { generateStockAnalysisWithOpenAI } from './openaiService';
import { generateRuleBasedAnalysis } from './ruleBasedService';
import { calculateFibonacciLevels } from './fibonacciService';

export async function analyzeStock(symbol: string, provider?: string, dataSource?: string, model?: string): Promise<AnalysisResult> {
  try {
    const source = dataSource || process.env.DATA_SOURCE || 'yahoo-finance';
    console.log(`Fetching data for ${symbol} from ${source}...`);

    let quote, timeSeries, indicators, fundamentals;

    // Fetch stock data from selected source
    if (source === 'yahoo-finance') {
      const yahooData = await getYahooStockData(symbol);
      quote = yahooData.quote;
      timeSeries = yahooData.timeSeries;
      indicators = yahooData.indicators;
      fundamentals = yahooData.fundamentals;
    } else if (source === 'fmp') {
      // Financial Modeling Prep
      const fmpData = await getFMPStockData(symbol);
      quote = fmpData.quote;
      timeSeries = fmpData.timeSeries;
      indicators = fmpData.indicators;
      fundamentals = fmpData.fundamentals;
    } else {
      // Alpha Vantage
      [quote, timeSeries] = await Promise.all([
        getStockQuote(symbol),
        getStockTimeSeries(symbol, 'daily'),
      ]);
      console.log(`Calculating technical indicators...`);
      indicators = calculateIndicators(timeSeries);
      fundamentals = {}; // No fundamental data for Alpha Vantage
    }

    // Pre-calculate sentiment to determine Fibonacci levels
    // Using professional technical analysis for trend determination
    const currentPrice = quote.price;
    const rsi = indicators.rsi.filter(v => !isNaN(v)).slice(-1)[0] || 50;
    const latestMACD = indicators.macd.macd.filter(v => !isNaN(v)).slice(-1)[0] || 0;
    const macdSignal = indicators.macd.signal.filter(v => !isNaN(v)).slice(-1)[0] || 0;
    const sma20 = indicators.sma20.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice;
    const sma50 = indicators.sma50.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice;
    const sma200 = indicators.sma200.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice;

    // Calculate trend score
    let trendScore = 0;

    // Price position relative to moving averages (40% weight)
    if (currentPrice > sma20) trendScore += 1;
    if (currentPrice > sma50) trendScore += 1.5;
    if (currentPrice > sma200) trendScore += 1;
    if (currentPrice < sma20) trendScore -= 1;
    if (currentPrice < sma50) trendScore -= 1.5;
    if (currentPrice < sma200) trendScore -= 1;

    // Moving average alignment - Golden/Death Cross (30% weight)
    if (sma20 > sma50) trendScore += 1.5;
    if (sma20 < sma50) trendScore -= 1.5;
    if (sma50 > sma200) trendScore += 0.5;
    if (sma50 < sma200) trendScore -= 0.5;

    // MACD momentum (20% weight)
    if (latestMACD > 0 && latestMACD > macdSignal) trendScore += 1;
    if (latestMACD < 0 && latestMACD < macdSignal) trendScore -= 1;

    // RSI confirmation (10% weight) - but not dominant
    if (rsi > 50 && rsi < 70) trendScore += 0.5; // Healthy bullish
    if (rsi < 50 && rsi > 30) trendScore -= 0.5; // Healthy bearish
    if (rsi > 70) trendScore += 0.2; // Overbought but still bullish
    if (rsi < 30) trendScore -= 0.2; // Oversold but still bearish

    // Determine sentiment based on score
    let preliminarySentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (trendScore >= 2.5) {
      preliminarySentiment = 'bullish';
    } else if (trendScore <= -2.5) {
      preliminarySentiment = 'bearish';
    } else {
      preliminarySentiment = 'neutral';
    }

    console.log(`Trend Score: ${trendScore.toFixed(2)} → ${preliminarySentiment.toUpperCase()} trend`);

    // Add Fibonacci levels based on preliminary sentiment
    const fibLevels = calculateFibonacciLevels(timeSeries, preliminarySentiment);
    if (fibLevels) {
      indicators.fibonacci = fibLevels;
      console.log(`Added ${fibLevels.type} Fibonacci levels for ${preliminarySentiment} trend`);
    }

    // Get AI provider from parameter or environment variable
    const aiProvider = (provider || process.env.AI_PROVIDER || 'rule-based').toLowerCase();

    console.log(`Generating analysis using ${aiProvider}...`);

    let analysis: AnalysisResult;

    switch (aiProvider) {
      case 'claude':
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error('ANTHROPIC_API_KEY is required when AI_PROVIDER=claude');
        }
        analysis = await generateStockAnalysis(symbol, quote, timeSeries, indicators, fundamentals, model);
        break;

      case 'openai':
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OPENAI_API_KEY is required when AI_PROVIDER=openai');
        }
        analysis = await generateStockAnalysisWithOpenAI(symbol, quote, timeSeries, indicators, fundamentals, model);
        break;

      case 'rule-based':
        // No API key required for rule-based analysis
        analysis = generateRuleBasedAnalysis(symbol, quote, timeSeries, indicators, fundamentals);
        break;

      default:
        console.warn(`Unknown AI_PROVIDER: ${aiProvider}, falling back to rule-based analysis`);
        analysis = generateRuleBasedAnalysis(symbol, quote, timeSeries, indicators, fundamentals);
    }

    console.log(`Analysis complete for ${symbol} using ${aiProvider}`);

    return analysis;
  } catch (error) {
    console.error(`Error analyzing stock ${symbol}:`, error);
    throw error;
  }
}
