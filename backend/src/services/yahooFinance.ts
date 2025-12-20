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
      marketCap: price?.marketCap as number | undefined,
      peRatio: summaryDetail?.trailingPE as number | undefined,
      forwardPE: summaryDetail?.forwardPE as number | undefined,
      pegRatio: keyStats?.pegRatio as number | undefined,
      priceToBook: keyStats?.priceToBook as number | undefined,
      priceToSales: price?.priceToSalesTrailing12Months as number | undefined,
      dividendYield: summaryDetail?.dividendYield ? (summaryDetail.dividendYield as number) * 100 : undefined,

      // 盈利能力
      earningsPerShare: keyStats?.trailingEps as number | undefined,
      revenue: financialData?.totalRevenue as number | undefined,
      profitMargin: financialData?.profitMargins ? (financialData.profitMargins as number) * 100 : undefined,
      operatingMargin: financialData?.operatingMargins ? (financialData.operatingMargins as number) * 100 : undefined,

      // 财务健康
      returnOnEquity: financialData?.returnOnEquity ? (financialData.returnOnEquity as number) * 100 : undefined,
      debtToEquity: financialData?.debtToEquity as number | undefined,
      currentRatio: financialData?.currentRatio as number | undefined,

      // 公司信息
      industry: profile?.industry as string | undefined,
      sector: profile?.sector as string | undefined,
      fullTimeEmployees: profile?.fullTimeEmployees as number | undefined,

      // 市场数据
      beta: keyStats?.beta as number | undefined,
      fiftyTwoWeekHigh: summaryDetail?.fiftyTwoWeekHigh as number | undefined,
      fiftyTwoWeekLow: summaryDetail?.fiftyTwoWeekLow as number | undefined,
      averageVolume: summaryDetail?.averageVolume as number | undefined,

      // 分析师预期
      targetMeanPrice: financialData?.targetMeanPrice as number | undefined,
      recommendationKey: financialData?.recommendationKey as string | undefined,
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
