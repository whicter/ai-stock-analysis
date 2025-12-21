import OpenAI from 'openai';
import { StockQuote, StockTimeSeries, TechnicalIndicators } from './alphaVantage';
import { AnalysisResult } from './claudeService';
import { FundamentalData, getYahooStockTimeSeriesMultiTF } from './yahooFinance';
import { analyzeCandlestickPatterns, formatPatternsForPrompt, TimeframePatterns } from './candlestickPatterns';

let client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!client) {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      throw new Error('OPENAI_API_KEY 未配置或无效');
    }
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
}

export async function generateStockAnalysisWithOpenAI(
  symbol: string,
  quote: StockQuote,
  timeSeries: StockTimeSeries[],
  indicators: TechnicalIndicators,
  fundamentals: FundamentalData,
  model?: string
): Promise<AnalysisResult> {
  const recentData = timeSeries.slice(-30);
  const currentPrice = quote.price;
  const rsi = indicators.rsi.filter(v => !isNaN(v)).slice(-1)[0] || 50;
  const latestMACD = indicators.macd.macd.filter(v => !isNaN(v)).slice(-1)[0] || 0;
  const sma20 = indicators.sma20.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice;
  const sma50 = indicators.sma50.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice;

  // Fetch multi-timeframe data and analyze candlestick patterns
  console.log('Analyzing candlestick patterns across multiple timeframes...');
  let candlestickSection = '';
  try {
    const [data1H, data4H, data1D, data1W] = await Promise.all([
      getYahooStockTimeSeriesMultiTF(symbol, '1h', 30).catch(() => null),
      getYahooStockTimeSeriesMultiTF(symbol, '4h', 60).catch(() => null),
      getYahooStockTimeSeriesMultiTF(symbol, '1d', 150).catch(() => null),
      getYahooStockTimeSeriesMultiTF(symbol, '1wk', 200).catch(() => null),
    ]);

    const timeframePatterns: TimeframePatterns[] = [];
    if (data1H && data1H.length > 20) timeframePatterns.push(analyzeCandlestickPatterns(data1H, '1H'));
    if (data4H && data4H.length > 20) timeframePatterns.push(analyzeCandlestickPatterns(data4H, '4H'));
    if (data1D && data1D.length > 20) timeframePatterns.push(analyzeCandlestickPatterns(data1D, '1D'));
    if (data1W && data1W.length > 20) timeframePatterns.push(analyzeCandlestickPatterns(data1W, '1W'));

    if (timeframePatterns.length > 0) {
      candlestickSection = formatPatternsForPrompt(timeframePatterns);
    }
  } catch (error) {
    console.error('Error analyzing candlestick patterns:', error);
    candlestickSection = '\n===== K线形态分析 =====\n暂时无法获取K线形态数据\n';
  }

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

  // Get SMA200 for complete analysis
  const sma200 = indicators.sma200.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice;
  const macdSignal = indicators.macd.signal.filter(v => !isNaN(v)).slice(-1)[0] || 0;

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
- MACD信号线: ${macdSignal.toFixed(2)} ${latestMACD > macdSignal ? '(MACD在信号线上方，看涨)' : '(MACD在信号线下方，看跌)'}

均线系统:
- SMA20日均线: $${sma20.toFixed(2)} ${currentPrice > sma20 ? '(价格在均线上方)' : '(价格在均线下方)'}
- SMA50日均线: $${sma50.toFixed(2)} ${currentPrice > sma50 ? '(价格在均线上方)' : '(价格在均线下方)'}
- SMA200日均线: $${sma200.toFixed(2)} ${currentPrice > sma200 ? '(价格在均线上方)' : '(价格在均线下方)'}
- 均线排列: ${sma20 > sma50 ? '金叉状态(SMA20>SMA50)' : '死叉状态(SMA20<SMA50)'}, ${sma50 > sma200 ? 'SMA50>SMA200' : 'SMA50<SMA200'}

布林带:
- 上轨: $${(indicators.bollingerBands.upper.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice).toFixed(2)}
- 中轨: $${(indicators.bollingerBands.middle.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice).toFixed(2)}
- 下轨: $${(indicators.bollingerBands.lower.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice).toFixed(2)}
${fibonacciSection}${candlestickSection}${fundamentalSection}
===== 近期价格走势 =====
${recentData.slice(-10).map(d => `${d.date}: 收盘$${d.close.toFixed(2)}, 最高$${d.high.toFixed(2)}, 最低$${d.low.toFixed(2)}, 成交量${d.volume.toLocaleString()}`).join('\n')}

===== 分析要求 =====
请提供以下格式的深度分析报告（用中文，要求详细、专业、具体）:

**重要：在开始分析前，请先基于上述技术指标综合判断当前的市场趋势**
- 考虑价格与均线的位置关系
- 考虑均线系统的排列（金叉/死叉）
- 考虑MACD的方向和位置
- 考虑RSI的区域（但不要让RSI主导判断）
- 给出明确的趋势判断：多头趋势/空头趋势/震荡趋势

1. 核心观点
   - 提供3-5个核心投资观点
   - 每个观点必须包含具体的价格目标位、时间框架、概率评估
   - 说明主要驱动因素和催化剂
   - 给出明确的操作建议（买入/卖出/持有）及仓位建议

2. 技术指标分析
   - 深度分析RSI、MACD、均线系统、布林带的当前状态及趋势
   - **K线形态分析**：结合上述提供的多时间级别（1H/4H/1D/1W）K线形态，分析：
     * 已确认形态的可靠性和预期影响
     * 可能正在形成的形态及确认条件
     * 不同时间级别形态的共振或背离
     * 形态对短期和中长期走势的指示意义
   - 识别并说明关键的支撑位和阻力位（至少3-5个价格点位）
   - 分析成交量变化及其对价格的影响
   - 如果有Fibonacci点位，详细说明每个关键点位的意义及交易策略
   - 给出具体的入场点、止损点、止盈点建议

3. 基本面分析
   - **公司业务与行业地位**：
     * 基于行业分类${fundamentals.sector ? fundamentals.sector : 'N/A'}/${fundamentals.industry ? fundamentals.industry : 'N/A'}，简要说明公司主营业务和商业模式
     * 分析公司在行业中的市场地位、市场份额、竞争优势
     * 识别主要竞争对手，说明公司与竞争对手的差异化优势
   - **关键财务指标深度解读**：
     * 详细分析市盈率(P/E)${fundamentals.peRatio ? fundamentals.peRatio.toFixed(2) : 'N/A'}、预期市盈率(Forward P/E)${fundamentals.forwardPE ? fundamentals.forwardPE.toFixed(2) : 'N/A'}、市净率(P/B)${fundamentals.priceToBook ? fundamentals.priceToBook.toFixed(2) : 'N/A'}、PEG比率${fundamentals.pegRatio ? fundamentals.pegRatio.toFixed(2) : 'N/A'}的含义
     * 深入解释这些估值指标在当前行业环境下是否合理
     * 对比当前P/E和Forward P/E，分析市场对未来增长的预期
     * 将估值指标与行业平均水平、历史水平、主要竞争对手进行详细对比
     * 说明估值是高估还是低估，高估/低估的程度及原因
   - **盈利能力全面分析**：
     * 净利润率${fundamentals.profitMargin ? fundamentals.profitMargin.toFixed(2) + '%' : 'N/A'}、营业利润率${fundamentals.operatingMargin ? fundamentals.operatingMargin.toFixed(2) + '%' : 'N/A'}、ROE${fundamentals.returnOnEquity ? fundamentals.returnOnEquity.toFixed(2) + '%' : 'N/A'}的深度解读
     * **关键**：判断这些盈利指标是在改善还是恶化，分析背后的原因（成本控制、定价权、规模效应等）
     * 分析盈利质量：是否依赖一次性收益、利润的可持续性如何
     * 与行业标杆企业进行对比，说明公司盈利能力的相对位置
     * EPS${fundamentals.earningsPerShare ? '$' + fundamentals.earningsPerShare.toFixed(2) : 'N/A'}的增长趋势和可持续性分析
   - **财务健康度详细评估**：
     * 负债权益比${fundamentals.debtToEquity ? fundamentals.debtToEquity.toFixed(2) : 'N/A'}、流动比率${fundamentals.currentRatio ? fundamentals.currentRatio.toFixed(2) : 'N/A'}反映的财务风险
     * 债务结构是否健康，偿债能力是否充足
     * **现金流分析**：经营活动现金流${fundamentals.operatingCashFlow ? '$' + (fundamentals.operatingCashFlow / 1e9).toFixed(2) + 'B' : 'N/A'}、自由现金流${fundamentals.freeCashFlow ? '$' + (fundamentals.freeCashFlow / 1e9).toFixed(2) + 'B' : 'N/A'}
     * 详细分析现金流的充裕程度、现金流与净利润的匹配度、现金创造能力
     * 评估现金流对业务扩张、研发投入、股息支付的支持能力
     * Beta系数${fundamentals.beta ? fundamentals.beta.toFixed(2) : 'N/A'}反映的系统性风险
   - **成长性与竞争力**：
     * 营收规模${fundamentals.revenue ? '$' + (fundamentals.revenue / 1e9).toFixed(2) + 'B' : 'N/A'}、市值${fundamentals.marketCap ? '$' + (fundamentals.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}在行业中的地位
     * 分析公司的核心竞争优势和护城河（品牌、技术、规模、网络效应、转换成本等）
     * **未来增长驱动因素**：详细分析哪些因素会驱动未来增长（新产品、市场扩张、技术创新等）
     * **增长风险**：识别可能阻碍增长的因素（市场饱和、监管变化、技术颠覆等）
     * 分析师目标价${fundamentals.targetMeanPrice ? '$' + fundamentals.targetMeanPrice.toFixed(2) : 'N/A'}${fundamentals.recommendationKey ? '、评级' + fundamentals.recommendationKey : ''}的参考意义及合理性
   - **股息与股东回报**：
     * 股息率${fundamentals.dividendYield ? fundamentals.dividendYield.toFixed(2) + '%' : '无'}的吸引力和可持续性
     * 分析公司的资本配置策略（分红vs再投资），评估管理层对股东回报的重视程度
   - **投资结论总结**：
     * **看涨因素（Bullish）**：列出3-5个支持投资的核心优势（基于上述分析）
     * **看跌因素（Bearish）**：列出3-5个投资风险点（基于上述分析）
     * **综合评分**：给出1-10分的评分，并详细解释评分理由

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
    // Use passed model, env var, or default to gpt-4o
    const selectedModel = model || process.env.OPENAI_MODEL || 'gpt-4o';
    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: [
        {
          role: 'system',
          content: '你是一位经验丰富的股票分析师，拥有20年以上的投资经验，擅长深度技术分析、基本面研究、风险评估和投资策略制定。你的分析报告详实、专业、具有很高的参考价值。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    });

    const analysisText = completion.choices[0]?.message?.content || '';

    console.log('========== OpenAI Response Text ==========');
    console.log(analysisText);
    console.log('==========================================');

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

    // Parse sections from GPT's response
    const sections = parseAnalysisText(analysisText);

    // Calculate target price
    let targetPrice = '';
    if (sentiment === 'bullish') {
      const target = currentPrice * 1.15;
      targetPrice = `$${target.toFixed(2)}`;
    } else if (sentiment === 'bearish') {
      const target = currentPrice * 0.85;
      targetPrice = `$${target.toFixed(2)}`;
    } else {
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
    console.error('Error generating OpenAI analysis:', error);
    throw error;
  }
}

function parseAnalysisText(text: string): {
  coreView: string;
  technicalAnalysis: string;
  fundamentalAnalysis: string;
  riskWarning: string;
} {
  // Find section headers - look for "2. **技术" pattern, not just "2."
  const lines = text.split('\n');
  let tech2Pos = -1;
  let fund3Pos = -1;
  let risk4Pos = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^2\.\s*\*\*?技术/i.test(line)) {
      tech2Pos = text.indexOf(lines[i]);
    } else if (/^3\.\s*\*\*?基本面/i.test(line)) {
      fund3Pos = text.indexOf(lines[i]);
    } else if (/^4\.\s*\*\*?风险/i.test(line)) {
      risk4Pos = text.indexOf(lines[i]);
    }
  }

  // Extract sections
  const coreView = tech2Pos >= 0 ? text.substring(0, tech2Pos).trim() : text.trim();
  const technicalAnalysis = tech2Pos >= 0 && fund3Pos > tech2Pos ? text.substring(tech2Pos, fund3Pos).trim() : '';
  const fundamentalAnalysis = fund3Pos >= 0 && risk4Pos > fund3Pos ? text.substring(fund3Pos, risk4Pos).trim() : '';
  const riskWarning = risk4Pos >= 0 ? text.substring(risk4Pos).trim() : '';

  // Remove section headers
  const cleanCoreView = coreView.replace(/1\.\s*\*\*?核心观点\*\*?[：:\s]*\n?/i, '').trim();
  const cleanTechnical = technicalAnalysis.replace(/2\.\s*\*\*?技术.*?分析\*\*?[：:\s]*\n?/i, '').trim();
  const cleanFundamental = fundamentalAnalysis.replace(/3\.\s*\*\*?基本面.*?分析\*\*?[：:\s]*\n?/i, '').trim();
  const cleanRisk = riskWarning.replace(/4\.\s*\*\*?风险.*?提示\*\*?[：:\s]*\n?/i, '').trim();

  return {
    coreView: cleanCoreView || '分析数据处理中...',
    technicalAnalysis: cleanTechnical || '技术指标分析中...',
    fundamentalAnalysis: cleanFundamental || '基本面分析中...',
    riskWarning: cleanRisk || '风险评估中...',
  };
}
