import YahooFinance from 'yahoo-finance2';
import { StockQuote, StockTimeSeries, TechnicalIndicators, calculateIndicators } from './alphaVantage';

const yahooFinance = new YahooFinance();

export interface FundamentalData {
  marketCap?: number;
  peRatio?: number;
  forwardPE?: number;
  pegRatio?: number;
  priceToBook?: number;
  priceToSales?: number;
  dividendYield?: number;
  earningsPerShare?: number;
  revenue?: number;
  profitMargin?: number;
  operatingMargin?: number;
  returnOnEquity?: number;
  debtToEquity?: number;
  currentRatio?: number;
  industry?: string;
  sector?: string;
  fullTimeEmployees?: number;
  beta?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  averageVolume?: number;
  targetMeanPrice?: number;
  recommendationKey?: string;
}

export async function getYahooStockQuote(symbol: string): Promise<StockQuote> {
  try {
    const quote = await yahooFinance.quote(symbol);

    if (!quote || !quote.regularMarketPrice) {
      throw new Error('无效的股票代码或无法获取数据');
    }

    const currentPrice = quote.regularMarketPrice;
    const previousClose = quote.regularMarketPreviousClose || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      symbol: quote.symbol,
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      volume: quote.regularMarketVolume || 0,
      high: quote.regularMarketDayHigh || currentPrice,
      low: quote.regularMarketDayLow || currentPrice,
      open: quote.regularMarketOpen || currentPrice,
      previousClose: previousClose,
    };
  } catch (error) {
    console.error('Error fetching Yahoo Finance quote:', error);
    throw new Error('无法从 Yahoo Finance 获取股票数据');
  }
}

export async function getYahooStockTimeSeries(symbol: string): Promise<StockTimeSeries[]> {
  try {
    // Get historical data for the last 100 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 150); // Get extra days to ensure we have 100 trading days

    const history = await yahooFinance.chart(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d',
    });

    if (!history || !history.quotes || history.quotes.length === 0) {
      throw new Error('无法获取历史数据');
    }

    // Convert to our format (v3 uses quotes array)
    const timeSeries: StockTimeSeries[] = history.quotes.map((day: any) => ({
      date: new Date(day.date).toISOString().split('T')[0],
      open: day.open || 0,
      high: day.high || 0,
      low: day.low || 0,
      close: day.close || 0,
      volume: day.volume || 0,
    })).filter((day: StockTimeSeries) => day.close > 0); // Filter out invalid data

    // Sort by date ascending
    return timeSeries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error fetching Yahoo Finance historical data:', error);
    throw new Error('无法从 Yahoo Finance 获取历史数据');
  }
}

export async function getYahooFundamentalData(symbol: string): Promise<FundamentalData> {
  try {
    const quote = await yahooFinance.quoteSummary(symbol, {
      modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData', 'price', 'summaryProfile']
    });

    const summaryDetail = quote.summaryDetail;
    const keyStats = quote.defaultKeyStatistics;
    const financialData = quote.financialData;
    const price = quote.price;
    const profile = quote.summaryProfile;

    return {
      // 估值指标
      marketCap: price?.marketCap,
      peRatio: summaryDetail?.trailingPE,
      forwardPE: summaryDetail?.forwardPE,
      pegRatio: keyStats?.pegRatio,
      priceToBook: keyStats?.priceToBook,
      priceToSales: price?.priceToSalesTrailing12Months,
      dividendYield: summaryDetail?.dividendYield ? summaryDetail.dividendYield * 100 : undefined,

      // 盈利能力
      earningsPerShare: keyStats?.trailingEps,
      revenue: financialData?.totalRevenue,
      profitMargin: financialData?.profitMargins ? financialData.profitMargins * 100 : undefined,
      operatingMargin: financialData?.operatingMargins ? financialData.operatingMargins * 100 : undefined,

      // 财务健康
      returnOnEquity: financialData?.returnOnEquity ? financialData.returnOnEquity * 100 : undefined,
      debtToEquity: financialData?.debtToEquity,
      currentRatio: financialData?.currentRatio,

      // 公司信息
      industry: profile?.industry,
      sector: profile?.sector,
      fullTimeEmployees: profile?.fullTimeEmployees,

      // 市场数据
      beta: keyStats?.beta,
      fiftyTwoWeekHigh: summaryDetail?.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: summaryDetail?.fiftyTwoWeekLow,
      averageVolume: summaryDetail?.averageVolume,

      // 分析师预期
      targetMeanPrice: financialData?.targetMeanPrice,
      recommendationKey: financialData?.recommendationKey,
    };
  } catch (error) {
    console.error('Error fetching Yahoo Finance fundamental data:', error);
    // Return empty object if fundamental data is not available
    return {};
  }
}

export async function getYahooStockData(symbol: string): Promise<{
  quote: StockQuote;
  timeSeries: StockTimeSeries[];
  indicators: TechnicalIndicators;
  fundamentals: FundamentalData;
}> {
  const [quote, timeSeries, fundamentals] = await Promise.all([
    getYahooStockQuote(symbol),
    getYahooStockTimeSeries(symbol),
    getYahooFundamentalData(symbol),
  ]);

  const indicators = calculateIndicators(timeSeries);

  return {
    quote,
    timeSeries,
    indicators,
    fundamentals,
  };
}
