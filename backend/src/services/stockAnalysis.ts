import { getStockQuote, getStockTimeSeries, calculateIndicators } from './alphaVantage';
import { getYahooStockData } from './yahooFinance';
import { generateStockAnalysis, AnalysisResult } from './claudeService';
import { generateStockAnalysisWithOpenAI } from './openaiService';
import { generateRuleBasedAnalysis } from './ruleBasedService';

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
