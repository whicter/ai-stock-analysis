import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { getYahooStockData } from './yahooFinance';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY 未配置');
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY 未配置');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function handleChat(
  symbol: string,
  provider: string,
  model: string | undefined,
  userMessage: string,
  conversationHistory: Message[]
): Promise<string> {
  // 获取股票数据作为上下文（用户看不到这部分）
  const stockData = await getYahooStockData(symbol);
  const { quote, timeSeries, indicators, fundamentals } = stockData;

  // 构建系统上下文（包含所有技术数据和基本面数据，但不会显示给用户）
  const systemContext = buildSystemContext(symbol, quote, timeSeries, indicators, fundamentals);

  if (provider === 'claude') {
    return await chatWithClaude(systemContext, userMessage, conversationHistory, model);
  } else if (provider === 'openai') {
    return await chatWithOpenAI(systemContext, userMessage, conversationHistory, model);
  } else {
    throw new Error('不支持的AI提供商');
  }
}

function buildSystemContext(symbol: string, quote: any, timeSeries: any[], indicators: any, fundamentals: any): string {
  const currentPrice = quote.price;
  const rsi = indicators.rsi.filter((v: number) => !isNaN(v)).slice(-1)[0] || 50;
  const latestMACD = indicators.macd.macd.filter((v: number) => !isNaN(v)).slice(-1)[0] || 0;
  const macdSignal = indicators.macd.signal.filter((v: number) => !isNaN(v)).slice(-1)[0] || 0;
  const sma20 = indicators.sma20.filter((v: number) => !isNaN(v)).slice(-1)[0] || currentPrice;
  const sma50 = indicators.sma50.filter((v: number) => !isNaN(v)).slice(-1)[0] || currentPrice;
  const sma200 = indicators.sma200.filter((v: number) => !isNaN(v)).slice(-1)[0] || currentPrice;
  const bbUpper = indicators.bollingerBands.upper.filter((v: number) => !isNaN(v)).slice(-1)[0] || currentPrice;
  const bbLower = indicators.bollingerBands.lower.filter((v: number) => !isNaN(v)).slice(-1)[0] || currentPrice;

  const recentPrices = timeSeries.slice(-10).map((d: any) => `${d.date}: $${d.close.toFixed(2)}`).join('\n');

  // Build fundamental data section
  let fundamentalSection = '';
  if (fundamentals && Object.keys(fundamentals).length > 0) {
    fundamentalSection = `
基本面数据:
${fundamentals.sector ? `- 行业板块: ${fundamentals.sector}` : ''}
${fundamentals.industry ? `- 细分行业: ${fundamentals.industry}` : ''}
${fundamentals.marketCap ? `- 市值: $${(fundamentals.marketCap / 1e9).toFixed(2)}B` : ''}
${fundamentals.peRatio ? `- 市盈率(P/E): ${fundamentals.peRatio.toFixed(2)}` : ''}
${fundamentals.priceToBook ? `- 市净率(P/B): ${fundamentals.priceToBook.toFixed(2)}` : ''}
${fundamentals.earningsPerShare ? `- 每股收益(EPS): $${fundamentals.earningsPerShare.toFixed(2)}` : ''}
${fundamentals.revenue ? `- 年营收: $${(fundamentals.revenue / 1e9).toFixed(2)}B` : ''}
${fundamentals.profitMargin !== undefined ? `- 净利润率: ${fundamentals.profitMargin.toFixed(2)}%` : ''}
${fundamentals.returnOnEquity !== undefined ? `- ROE: ${fundamentals.returnOnEquity.toFixed(2)}%` : ''}
${fundamentals.debtToEquity !== undefined ? `- 负债权益比: ${fundamentals.debtToEquity.toFixed(2)}` : ''}
${fundamentals.beta !== undefined ? `- Beta: ${fundamentals.beta.toFixed(2)}` : ''}
${fundamentals.dividendYield !== undefined ? `- 股息率: ${fundamentals.dividendYield.toFixed(2)}%` : ''}
${fundamentals.targetMeanPrice ? `- 分析师目标价: $${fundamentals.targetMeanPrice.toFixed(2)}` : ''}
${fundamentals.recommendationKey ? `- 分析师评级: ${fundamentals.recommendationKey}` : ''}
`;
  }

  return `你是一位专业的股票分析师。用户正在咨询关于股票 ${symbol} 的问题。

以下是该股票的实时数据（这些数据不要直接展示给用户，而是作为你分析的依据）：

当前价格: $${currentPrice.toFixed(2)}
涨跌幅: ${quote.changePercent.toFixed(2)}%
今日最高: $${quote.high.toFixed(2)}
今日最低: $${quote.low.toFixed(2)}
成交量: ${quote.volume.toLocaleString()}

技术指标:
- RSI(14): ${rsi.toFixed(2)}
- MACD: ${latestMACD.toFixed(2)}
- MACD信号线: ${macdSignal.toFixed(2)}
- 20日均线: $${sma20.toFixed(2)}
- 50日均线: $${sma50.toFixed(2)}
- 200日均线: $${sma200.toFixed(2)}
- 布林带上轨: $${bbUpper.toFixed(2)}
- 布林带下轨: $${bbLower.toFixed(2)}
${fundamentalSection}
近10日收盘价:
${recentPrices}

技术分析要点:
- RSI ${rsi > 70 ? '超买' : rsi < 30 ? '超卖' : '正常'}
- MACD ${latestMACD > macdSignal ? '金叉(看涨)' : '死叉(看跌)'}
- 价格相对20日均线: ${currentPrice > sma20 ? '上方(支撑)' : '下方(阻力)'}
- 价格相对200日均线: ${currentPrice > sma200 ? '上方(长期牛市)' : '下方(长期熊市)'}

请注意：
1. 用中文回答
2. 回答要专业但通俗易懂
3. 基于上述技术和基本面数据进行分析，但不要机械地罗列数据
4. 给出具体的建议和观点
5. 必要时提醒风险
6. 保持客观，不要过度乐观或悲观`;
}

async function chatWithClaude(
  systemContext: string,
  userMessage: string,
  conversationHistory: Message[],
  model?: string
): Promise<string> {
  const client = getAnthropicClient();
  const selectedModel = model || 'claude-sonnet-4-5-20251101';

  // 构建消息历史
  const messages = [
    ...conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    {
      role: 'user' as const,
      content: userMessage,
    },
  ];

  const response = await client.messages.create({
    model: selectedModel,
    max_tokens: 1024,
    system: systemContext,
    messages: messages,
  });

  const content = response.content[0];
  return content.type === 'text' ? content.text : '无法生成回复';
}

async function chatWithOpenAI(
  systemContext: string,
  userMessage: string,
  conversationHistory: Message[],
  model?: string
): Promise<string> {
  const client = getOpenAIClient();
  const selectedModel = model || process.env.OPENAI_MODEL || 'gpt-4o';

  // 构建消息历史
  const messages = [
    {
      role: 'system' as const,
      content: systemContext,
    },
    ...conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    {
      role: 'user' as const,
      content: userMessage,
    },
  ];

  const response = await client.chat.completions.create({
    model: selectedModel,
    messages: messages,
    max_tokens: 1024,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || '无法生成回复';
}
