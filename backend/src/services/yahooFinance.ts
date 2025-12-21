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
  operatingCashFlow?: number;
  freeCashFlow?: number;
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

export async function getYahooStockTimeSeriesMultiTF(
  symbol: string,
  interval: '1h' | '4h' | '1d' | '1wk' = '1d',
  daysBack: number = 150
): Promise<StockTimeSeries[]> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Yahoo Finance doesn't support 4h, so we use 1h and aggregate later
    const yahooInterval = interval === '4h' ? '1h' : interval;

    const history = await yahooFinance.chart(symbol, {
      period1: startDate,
      period2: endDate,
      interval: yahooInterval as '1h' | '1d' | '1wk',
    });

    if (!history || !history.quotes || history.quotes.length === 0) {
      throw new Error('无法获取历史数据');
    }

    // Convert to our format
    let timeSeries: StockTimeSeries[] = history.quotes
      .filter((q: any) => q.open && q.high && q.low && q.close)
      .map((q: any) => ({
        date: new Date(q.date).toISOString(),
        open: q.open,
        high: q.high,
        low: q.low,
        close: q.close,
        volume: q.volume || 0,
      }));

    // If 4h interval, aggregate 4 hourly candles into one
    if (interval === '4h') {
      const aggregated: StockTimeSeries[] = [];
      for (let i = 0; i < timeSeries.length; i += 4) {
        const chunk = timeSeries.slice(i, i + 4);
        if (chunk.length > 0) {
          aggregated.push({
            date: chunk[chunk.length - 1].date,
            open: chunk[0].open,
            high: Math.max(...chunk.map(c => c.high)),
            low: Math.min(...chunk.map(c => c.low)),
            close: chunk[chunk.length - 1].close,
            volume: chunk.reduce((sum, c) => sum + c.volume, 0),
          });
        }
      }
      timeSeries = aggregated;
    }

    return timeSeries;
  } catch (error) {
    console.error(`Error fetching Yahoo Finance ${interval} data:`, error);
    throw new Error(`无法从 Yahoo Finance 获取${interval}数据`);
  }
}

export async function getYahooStockTimeSeries(symbol: string): Promise<StockTimeSeries[]> {
  return getYahooStockTimeSeriesMultiTF(symbol, '1d', 150);
}

export async function getYahooFundamentalData(symbol: string): Promise<FundamentalData> {
  try {
    const quote = await yahooFinance.quoteSummary(symbol, {
      modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData', 'price', 'summaryProfile', 'cashflowStatementHistory']
    });

    const summaryDetail = quote.summaryDetail;
    const keyStats = quote.defaultKeyStatistics;
    const financialData = quote.financialData;
    const price = quote.price;
    const profile = quote.summaryProfile;
    const cashflow = quote.cashflowStatementHistory?.cashflowStatements?.[0];

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

      // 现金流
      operatingCashFlow: (cashflow as any)?.totalCashFromOperatingActivities as number | undefined,
      freeCashFlow: financialData?.freeCashflow as number | undefined,
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
