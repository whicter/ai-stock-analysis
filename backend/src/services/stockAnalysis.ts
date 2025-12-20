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
    // Using simple technical indicators for initial sentiment determination
    const currentPrice = quote.price;
    const rsi = indicators.rsi.filter(v => !isNaN(v)).slice(-1)[0] || 50;
    const latestMACD = indicators.macd.macd.filter(v => !isNaN(v)).slice(-1)[0] || 0;
    const sma20 = indicators.sma20.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice;
    const sma50 = indicators.sma50.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice;

    let preliminarySentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (rsi > 70 || currentPrice < sma20 * 0.95) {
      preliminarySentiment = 'bearish';
    } else if (rsi < 30 || currentPrice > sma20 * 1.05) {
      preliminarySentiment = 'bullish';
    } else if (currentPrice > sma20 && currentPrice > sma50 && latestMACD > 0) {
      preliminarySentiment = 'bullish';
    } else if (currentPrice < sma20 && currentPrice < sma50 && latestMACD < 0) {
      preliminarySentiment = 'bearish';
    }

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
