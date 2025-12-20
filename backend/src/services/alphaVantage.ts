import axios from 'axios';

const BASE_URL = 'https://www.alphavantage.co/query';

function getApiKey(): string {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    throw new Error('ALPHA_VANTAGE_API_KEY is not configured in .env file');
  }
  return apiKey;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface StockTimeSeries {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number[];
  macd: {
    macd: number[];
    signal: number[];
    histogram: number[];
  };
  sma20: number[];
  sma50: number[];
  sma200: number[];
  bollingerBands: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
}

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  try {
    const apiKey = getApiKey();
    console.log('Alpha Vantage API Key loaded:', apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No');

    const response = await axios.get(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: apiKey,
      },
    });

    console.log('Alpha Vantage API Response:', JSON.stringify(response.data, null, 2));

    const quote = response.data['Global Quote'];

    if (!quote || Object.keys(quote).length === 0) {
      // Check if there's an error message or rate limit info
      if (response.data['Note']) {
        throw new Error(`Alpha Vantage API限制: ${response.data['Note']}`);
      }
      if (response.data['Information']) {
        throw new Error(`Alpha Vantage信息: ${response.data['Information']}`);
      }
      throw new Error('无效的股票代码或API限制');
    }

    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      open: parseFloat(quote['02. open']),
      previousClose: parseFloat(quote['08. previous close']),
    };
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    throw error;
  }
}

export async function getStockTimeSeries(symbol: string, period: 'daily' | 'weekly' = 'daily'): Promise<StockTimeSeries[]> {
  try {
    const apiKey = getApiKey();

    const response = await axios.get(BASE_URL, {
      params: {
        function: period === 'daily' ? 'TIME_SERIES_DAILY' : 'TIME_SERIES_WEEKLY',
        symbol,
        apikey: apiKey,
        outputsize: 'compact', // last 100 data points
      },
    });

    console.log('Alpha Vantage Time Series Response keys:', Object.keys(response.data));

    const timeSeriesKey = period === 'daily' ? 'Time Series (Daily)' : 'Weekly Time Series';
    const timeSeries = response.data[timeSeriesKey];

    if (!timeSeries) {
      // Check if there's an error message or rate limit info
      if (response.data['Note']) {
        throw new Error(`Alpha Vantage API限制: ${response.data['Note']}`);
      }
      if (response.data['Information']) {
        throw new Error(`Alpha Vantage信息: ${response.data['Information']}`);
      }
      throw new Error('无法获取时间序列数据');
    }

    const data: StockTimeSeries[] = [];
    for (const [date, values] of Object.entries(timeSeries)) {
      data.push({
        date,
        open: parseFloat((values as any)['1. open']),
        high: parseFloat((values as any)['2. high']),
        low: parseFloat((values as any)['3. low']),
        close: parseFloat((values as any)['4. close']),
        volume: parseInt((values as any)['5. volume']),
      });
    }

    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error fetching time series:', error);
    throw error;
  }
}

export async function getTechnicalIndicators(symbol: string): Promise<Partial<TechnicalIndicators>> {
  try {
    const apiKey = getApiKey();

    // Get RSI
    const rsiResponse = await axios.get(BASE_URL, {
      params: {
        function: 'RSI',
        symbol,
        interval: 'daily',
        time_period: 14,
        series_type: 'close',
        apikey: apiKey,
      },
    });

    const rsiData = rsiResponse.data['Technical Analysis: RSI'];
    const rsi = rsiData ? Object.values(rsiData).map((v: any) => parseFloat(v.RSI)).slice(0, 30) : [];

    // Note: Alpha Vantage has rate limits, so in production you'd want to:
    // 1. Cache these results
    // 2. Make requests sequentially with delays
    // 3. Or use a paid tier
    // For now, we'll just get RSI and calculate others from time series data

    return {
      rsi: rsi.reverse(),
    };
  } catch (error) {
    console.error('Error fetching technical indicators:', error);
    return {};
  }
}

// Calculate technical indicators from time series data
export function calculateIndicators(timeSeries: StockTimeSeries[]): TechnicalIndicators {
  const closes = timeSeries.map(d => d.close);

  return {
    rsi: calculateRSI(closes, 14),
    macd: calculateMACD(closes),
    sma20: calculateSMA(closes, 20),
    sma50: calculateSMA(closes, 50),
    sma200: calculateSMA(closes, 200),
    bollingerBands: calculateBollingerBands(closes, 20, 2),
  };
}

function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

function calculateRSI(data: number[], period: number): number[] {
  const result: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }

  for (let i = 0; i < gains.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      result.push(rsi);
    }
  }

  return [NaN, ...result]; // Add NaN at start since we lose one value in change calculation
}

function calculateMACD(data: number[]): { macd: number[]; signal: number[]; histogram: number[] } {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  const macd = ema12.map((val, i) => val - ema26[i]);
  const signal = calculateEMA(macd, 9);
  const histogram = macd.map((val, i) => val - signal[i]);

  return { macd, signal, histogram };
}

function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);

  // Start with SMA
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else if (i === period - 1) {
      result.push(ema);
    } else {
      ema = (data[i] - ema) * multiplier + ema;
      result.push(ema);
    }
  }

  return result;
}

function calculateBollingerBands(data: number[], period: number, stdDev: number): { upper: number[]; middle: number[]; lower: number[] } {
  const sma = calculateSMA(data, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      lower.push(NaN);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = sma[i];
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const std = Math.sqrt(variance);
      upper.push(mean + stdDev * std);
      lower.push(mean - stdDev * std);
    }
  }

  return { upper, middle: sma, lower };
}
