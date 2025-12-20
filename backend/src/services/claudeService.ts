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

  // Build Fibonacci levels section if available
  let fibonacciSection = '';
  if (indicators.fibonacci) {
    const fibType = indicators.fibonacci.type === 'extension' ? 'Fibonacci扩展位 (多头趋势)' : 'Fibonacci回撤位 (空头趋势)';
    fibonacciSection = `
${fibType}:
${indicators.fibonacci.levels.map(l => `- ${l.label}: $${l.price.toFixed(2)}`).join('\n')}
`;
  }

  const prompt = `你是一位资深的股票分析师，拥有20年以上的市场经验。请基于以下数据对股票 ${symbol} 进行深度、全面的专业分析：

===== 实时行情数据 =====
股票代码: ${symbol}
当前价格: $${currentPrice.toFixed(2)}
涨跌幅: ${quote.changePercent.toFixed(2)}%
今日最高价: $${quote.high.toFixed(2)}
今日最低价: $${quote.low.toFixed(2)}
成交量: ${quote.volume.toLocaleString()}
开盘价: $${quote.open.toFixed(2)}
昨日收盘: $${quote.previousClose.toFixed(2)}

===== 技术指标详情 =====
动量指标:
- RSI(14): ${rsi.toFixed(2)} ${rsi > 70 ? '(超买区域)' : rsi < 30 ? '(超卖区域)' : '(中性区域)'}
- MACD: ${latestMACD.toFixed(2)} ${latestMACD > 0 ? '(正值，看涨)' : '(负值，看跌)'}

均线系统:
- SMA20日均线: $${sma20.toFixed(2)} ${currentPrice > sma20 ? '(价格在均线上方)' : '(价格在均线下方)'}
- SMA50日均线: $${sma50.toFixed(2)} ${currentPrice > sma50 ? '(价格在均线上方)' : '(价格在均线下方)'}

布林带:
- 上轨: $${(indicators.bollingerBands.upper.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice).toFixed(2)}
- 中轨: $${(indicators.bollingerBands.middle.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice).toFixed(2)}
- 下轨: $${(indicators.bollingerBands.lower.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice).toFixed(2)}
${fibonacciSection}${fundamentalSection}
===== 近期价格走势 =====
${recentData.slice(-10).map(d => `${d.date}: 收盘$${d.close.toFixed(2)}, 最高$${d.high.toFixed(2)}, 最低$${d.low.toFixed(2)}, 成交量${d.volume.toLocaleString()}`).join('\n')}

===== 分析要求 =====
请提供以下格式的深度分析报告（用中文，要求详细、专业、具体）:

1. 核心观点
   - 提供3-5个核心投资观点
   - 每个观点必须包含具体的价格目标位、时间框架、概率评估
   - 说明主要驱动因素和催化剂
   - 给出明确的操作建议（买入/卖出/持有）及仓位建议

2. 技术指标分析
   - 深度分析RSI、MACD、均线系统、布林带的当前状态及趋势
   - 识别并说明关键的支撑位和阻力位（至少3-5个价格点位）
   - 分析成交量变化及其对价格的影响
   - 识别技术形态（如头肩顶、双底、三角形等）
   - 如果有Fibonacci点位，详细说明每个关键点位的意义及交易策略
   - 给出具体的入场点、止损点、止盈点建议

3. 基本面分析
   - 深入评估公司估值水平（与行业平均对比，说明是高估还是低估及程度）
   - 详细分析盈利能力（利润率趋势、与竞争对手对比）
   - 评估财务健康度（债务水平、现金流状况、偿债能力）
   - 分析公司在行业中的竞争地位和护城河
   - 评估增长潜力（营收增长、市场份额、新产品/服务）
   - 说明股息情况及其可持续性（如适用）
   - 综合评分（1-10分）并解释评分理由

4. 风险提示
   - 列出5-8个主要风险点
   - 每个风险点要说明：风险性质、发生概率、潜在影响程度、应对策略
   - 区分短期风险和长期风险
   - 提供风险评级（低/中/高）

请确保分析：
- 专业且详细，每个部分至少200字
- 包含具体的数字、价格水平、时间预期、概率评估
- 充分利用所有提供的技术和基本面数据
- 提供可操作的投资建议
- 使用专业术语但保持易懂`;

  try {
    const anthropic = getAnthropicClient();
    // Use passed model or default to Claude Sonnet 4.5
    const selectedModel = model || 'claude-sonnet-4-5-20251101';
    const message = await anthropic.messages.create({
      model: selectedModel,
      max_tokens: 4096,
      system: '你是一位经验丰富的股票分析师，拥有20年以上的投资经验，擅长深度技术分析、基本面研究、风险评估和投资策略制定。你的分析报告详实、专业、具有很高的参考价值。',
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
        fibonacci: indicators.fibonacci,
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
