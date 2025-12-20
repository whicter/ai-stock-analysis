import Anthropic from '@anthropic-ai/sdk';
import { StockQuote, StockTimeSeries, TechnicalIndicators } from './alphaVantage';
import { FundamentalData } from './yahooFinance';

let client: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_claude_api_key_here') {
      throw new Error('ANTHROPIC_API_KEY 未配置或无效');
    }
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return client;
}

export interface AnalysisResult {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  technicalPoints: {
    strength: number;
    priceRange: { min: number; max: number; label: string };
    resistance: { level: number; label: string };
    support: { level: number; label: string };
    momentum: { value: number; label: string };
  };
  report: {
    title: string;
    date: string;
    targetPrice: string;
    sections: {
      coreView: string;
      technicalAnalysis: string;
      fundamentalAnalysis: string;
      riskWarning: string;
    };
  };
}

export async function generateStockAnalysis(
  symbol: string,
  quote: StockQuote,
  timeSeries: StockTimeSeries[],
  indicators: TechnicalIndicators,
  fundamentals: FundamentalData,
  model?: string
): Promise<AnalysisResult> {
  const recentData = timeSeries.slice(-30); // Last 30 days
  const currentPrice = quote.price;
  const rsi = indicators.rsi.filter(v => !isNaN(v)).slice(-1)[0] || 50;
  const latestMACD = indicators.macd.macd.filter(v => !isNaN(v)).slice(-1)[0] || 0;
  const sma20 = indicators.sma20.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice;
  const sma50 = indicators.sma50.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice;

  // Build fundamental data section
  let fundamentalSection = '';
  if (fundamentals && Object.keys(fundamentals).length > 0) {
    fundamentalSection = `
基本面数据:
${fundamentals.sector ? `- 行业板块: ${fundamentals.sector}` : ''}
${fundamentals.industry ? `- 细分行业: ${fundamentals.industry}` : ''}
${fundamentals.marketCap ? `- 市值: $${(fundamentals.marketCap / 1e9).toFixed(2)}B` : ''}
${fundamentals.peRatio ? `- 市盈率(P/E): ${fundamentals.peRatio.toFixed(2)}` : ''}
${fundamentals.forwardPE ? `- 预期市盈率: ${fundamentals.forwardPE.toFixed(2)}` : ''}
${fundamentals.priceToBook ? `- 市净率(P/B): ${fundamentals.priceToBook.toFixed(2)}` : ''}
${fundamentals.priceToSales ? `- 市销率(P/S): ${fundamentals.priceToSales.toFixed(2)}` : ''}
${fundamentals.pegRatio ? `- PEG比率: ${fundamentals.pegRatio.toFixed(2)}` : ''}
${fundamentals.earningsPerShare ? `- 每股收益(EPS): $${fundamentals.earningsPerShare.toFixed(2)}` : ''}
${fundamentals.revenue ? `- 年营收: $${(fundamentals.revenue / 1e9).toFixed(2)}B` : ''}
${fundamentals.profitMargin !== undefined ? `- 净利润率: ${fundamentals.profitMargin.toFixed(2)}%` : ''}
${fundamentals.operatingMargin !== undefined ? `- 营业利润率: ${fundamentals.operatingMargin.toFixed(2)}%` : ''}
${fundamentals.returnOnEquity !== undefined ? `- 净资产收益率(ROE): ${fundamentals.returnOnEquity.toFixed(2)}%` : ''}
${fundamentals.debtToEquity !== undefined ? `- 负债权益比: ${fundamentals.debtToEquity.toFixed(2)}` : ''}
${fundamentals.currentRatio ? `- 流动比率: ${fundamentals.currentRatio.toFixed(2)}` : ''}
${fundamentals.beta !== undefined ? `- Beta系数: ${fundamentals.beta.toFixed(2)}` : ''}
${fundamentals.dividendYield !== undefined ? `- 股息率: ${fundamentals.dividendYield.toFixed(2)}%` : ''}
${fundamentals.targetMeanPrice ? `- 分析师目标价: $${fundamentals.targetMeanPrice.toFixed(2)}` : ''}
${fundamentals.recommendationKey ? `- 分析师评级: ${fundamentals.recommendationKey}` : ''}
${fundamentals.fiftyTwoWeekHigh ? `- 52周最高: $${fundamentals.fiftyTwoWeekHigh.toFixed(2)}` : ''}
${fundamentals.fiftyTwoWeekLow ? `- 52周最低: $${fundamentals.fiftyTwoWeekLow.toFixed(2)}` : ''}
`;
  }

  const prompt = `你是一位专业的股票分析师。请基于以下数据对股票 ${symbol} 进行全面分析：

股票代码: ${symbol}
当前价格: $${currentPrice.toFixed(2)}
涨跌幅: ${quote.changePercent.toFixed(2)}%
最高价: $${quote.high.toFixed(2)}
最低价: $${quote.low.toFixed(2)}
成交量: ${quote.volume.toLocaleString()}

技术指标:
- RSI(14): ${rsi.toFixed(2)}
- MACD: ${latestMACD.toFixed(2)}
- SMA20: $${sma20.toFixed(2)}
- SMA50: $${sma50.toFixed(2)}
- 布林带上轨: $${(indicators.bollingerBands.upper.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice).toFixed(2)}
- 布林带下轨: $${(indicators.bollingerBands.lower.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice).toFixed(2)}
${fundamentalSection}
30日价格走势:
${recentData.slice(-10).map(d => `${d.date}: $${d.close.toFixed(2)}`).join('\n')}

请提供以下格式的分析报告（用中文）:

1. 核心观点 (2-3个要点，每个要点包含具体的价格目标或时间框架)
2. 技术指标分析 (详细分析RSI、MACD、均线系统、布林带等，给出具体的支撑位和阻力位)
3. 基本面分析 (结合上述基本面数据，深入分析公司估值水平、盈利能力、财务健康度、行业地位等，给出具体的财务指标评价)
4. 风险提示 (列出3-5个主要风险点)

请确保分析专业、具体，包含实际的价格水平和时间预期。基本面分析部分请充分利用上述提供的财务数据进行深入分析。`;

  try {
    const anthropic = getAnthropicClient();
    // Use passed model or default to Claude Sonnet 4.5
    const selectedModel = model || 'claude-sonnet-4-5-20251101';
    const message = await anthropic.messages.create({
      model: selectedModel,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const analysisText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Determine sentiment based on technical indicators
    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (rsi > 70 || currentPrice < sma20 * 0.95) {
      sentiment = 'bearish';
    } else if (rsi < 30 || currentPrice > sma20 * 1.05) {
      sentiment = 'bullish';
    } else if (currentPrice > sma20 && currentPrice > sma50 && latestMACD > 0) {
      sentiment = 'bullish';
    } else if (currentPrice < sma20 && currentPrice < sma50 && latestMACD < 0) {
      sentiment = 'bearish';
    }

    // Calculate technical points
    const high52Week = Math.max(...timeSeries.map(d => d.high));
    const low52Week = Math.min(...timeSeries.map(d => d.low));
    const resistance = indicators.bollingerBands.upper.filter(v => !isNaN(v)).slice(-1)[0] || high52Week;
    const support = indicators.bollingerBands.lower.filter(v => !isNaN(v)).slice(-1)[0] || low52Week;

    // Parse sections from Claude's response
    const sections = parseAnalysisText(analysisText);

    // Calculate target price based on sentiment and technical analysis
    let targetPrice = '';
    if (sentiment === 'bullish') {
      const target = currentPrice * 1.15;
      targetPrice = `$${target.toFixed(2)}`;
    } else if (sentiment === 'bearish') {
      const target = currentPrice * 0.85;
      targetPrice = `$${target.toFixed(2)}`;
    } else {
      const target = (resistance + support) / 2;
      targetPrice = `$${support.toFixed(2)} - $${resistance.toFixed(2)}`;
    }

    return {
      sentiment,
      technicalPoints: {
        strength: rsi,
        priceRange: {
          min: quote.low,
          max: quote.high,
          label: sentiment === 'bullish' ? '突破支撑区' : sentiment === 'bearish' ? '跌破支撑区' : '震荡区间',
        },
        resistance: {
          level: resistance,
          label: '阻力位',
        },
        support: {
          level: support,
          label: '支撑位',
        },
        momentum: {
          value: rsi,
          label: rsi > 70 ? '超买区域' : rsi < 30 ? '超卖区域' : '中性区域',
        },
      },
      report: {
        title: `${symbol} 深度投资研报`,
        date: new Date().toISOString().split('T')[0],
        targetPrice,
        sections,
      },
    };
  } catch (error) {
    console.error('Error generating Claude analysis:', error);
    throw error;
  }
}

function parseAnalysisText(text: string): {
  coreView: string;
  technicalAnalysis: string;
  fundamentalAnalysis: string;
  riskWarning: string;
} {
  const sections = {
    coreView: '',
    technicalAnalysis: '',
    fundamentalAnalysis: '',
    riskWarning: '',
  };

  // Match multiple formats with whitespace flexibility:
  // "### 1. 核心观点", "1. 核心观点", or "### 核心观点"
  // Added \s* before lookahead to handle newlines between sections
  const coreViewMatch = text.match(/(?:###?\s*)?(?:1\.\s*)?核心观点[：:\s]*([\s\S]*?)(?=\s*(?:###?\s*)?(?:2\.\s*)?技术|$)/i);
  const technicalMatch = text.match(/(?:###?\s*)?(?:2\.\s*)?技术(?:指标)?分析[：:\s]*([\s\S]*?)(?=\s*(?:###?\s*)?(?:3\.\s*)?基本面|$)/i);
  const fundamentalMatch = text.match(/(?:###?\s*)?(?:3\.\s*)?基本面分析[：:\s]*([\s\S]*?)(?=\s*(?:###?\s*)?(?:4\.\s*)?风险|$)/i);
  const riskMatch = text.match(/(?:###?\s*)?(?:4\.\s*)?风险提示[：:\s]*([\s\S]*?)$/i);

  sections.coreView = coreViewMatch ? coreViewMatch[1].trim() : '分析数据处理中...';
  sections.technicalAnalysis = technicalMatch ? technicalMatch[1].trim() : '技术指标分析中...';
  sections.fundamentalAnalysis = fundamentalMatch ? fundamentalMatch[1].trim() : '基本面分析中...';
  sections.riskWarning = riskMatch ? riskMatch[1].trim() : '风险评估中...';

  console.log('Parsed sections lengths:', {
    coreView: sections.coreView.length,
    technical: sections.technicalAnalysis.length,
    fundamental: sections.fundamentalAnalysis.length,
    risk: sections.riskWarning.length,
  });

  return sections;
}
