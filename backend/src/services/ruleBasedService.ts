import { StockQuote, StockTimeSeries, TechnicalIndicators } from './alphaVantage';
import { AnalysisResult } from './claudeService';
import { FundamentalData } from './yahooFinance';

export function generateRuleBasedAnalysis(
  symbol: string,
  quote: StockQuote,
  timeSeries: StockTimeSeries[],
  indicators: TechnicalIndicators,
  fundamentals: FundamentalData
): AnalysisResult {
  const currentPrice = quote.price;
  const rsi = indicators.rsi.filter(v => !isNaN(v)).slice(-1)[0] || 50;
  const latestMACD = indicators.macd.macd.filter(v => !isNaN(v)).slice(-1)[0] || 0;
  const macdSignal = indicators.macd.signal.filter(v => !isNaN(v)).slice(-1)[0] || 0;
  const sma20 = indicators.sma20.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice;
  const sma50 = indicators.sma50.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice;
  const sma200 = indicators.sma200.filter(v => !isNaN(v)).slice(-1)[0] || currentPrice;

  // Determine sentiment based on rules
  let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  let sentimentScore = 0;

  // RSI analysis
  if (rsi < 30) sentimentScore += 2; // Oversold - bullish
  else if (rsi > 70) sentimentScore -= 2; // Overbought - bearish
  else if (rsi >= 40 && rsi <= 60) sentimentScore += 0; // Neutral

  // MACD analysis
  if (latestMACD > macdSignal) sentimentScore += 1; // Bullish crossover
  else if (latestMACD < macdSignal) sentimentScore -= 1; // Bearish crossover

  // Moving average analysis
  if (currentPrice > sma20 && sma20 > sma50) sentimentScore += 2; // Strong uptrend
  else if (currentPrice < sma20 && sma20 < sma50) sentimentScore -= 2; // Strong downtrend

  if (currentPrice > sma200) sentimentScore += 1; // Above long-term MA
  else if (currentPrice < sma200) sentimentScore -= 1; // Below long-term MA

  // Determine final sentiment
  if (sentimentScore >= 2) sentiment = 'bullish';
  else if (sentimentScore <= -2) sentiment = 'bearish';
  else sentiment = 'neutral';

  // Calculate technical points
  const high52Week = Math.max(...timeSeries.map(d => d.high));
  const low52Week = Math.min(...timeSeries.map(d => d.low));
  const resistance = indicators.bollingerBands.upper.filter(v => !isNaN(v)).slice(-1)[0] || high52Week;
  const support = indicators.bollingerBands.lower.filter(v => !isNaN(v)).slice(-1)[0] || low52Week;

  // Calculate target price
  let targetPrice = '';
  if (sentiment === 'bullish') {
    const target = Math.min(currentPrice * 1.15, resistance * 1.05);
    targetPrice = `$${target.toFixed(2)}`;
  } else if (sentiment === 'bearish') {
    const target = Math.max(currentPrice * 0.85, support * 0.95);
    targetPrice = `$${target.toFixed(2)}`;
  } else {
    targetPrice = `$${support.toFixed(2)} - $${resistance.toFixed(2)}`;
  }

  // Generate report sections
  const sections = {
    coreView: generateCoreView(symbol, sentiment, currentPrice, targetPrice, rsi, sma20, sma50),
    technicalAnalysis: generateTechnicalAnalysis(rsi, latestMACD, macdSignal, sma20, sma50, sma200, currentPrice, resistance, support),
    fundamentalAnalysis: generateFundamentalAnalysis(symbol, sentiment, fundamentals),
    riskWarning: generateRiskWarning(sentiment, rsi, quote.changePercent),
  };

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
}

function generateCoreView(
  symbol: string,
  sentiment: string,
  currentPrice: number,
  targetPrice: string,
  rsi: number,
  sma20: number,
  sma50: number
): string {
  const trendText = sentiment === 'bullish' ? '看涨' : sentiment === 'bearish' ? '看跌' : '震荡';
  const priceVsSMA = currentPrice > sma20 ? '站上' : '跌破';

  return `
• 趋势判断：${symbol} 当前处于${trendText}趋势，目标价位 ${targetPrice}

• 技术位置：股价${priceVsSMA} 20日均线（$${sma20.toFixed(2)}），RSI 指标为 ${rsi.toFixed(1)}，${rsi > 70 ? '处于超买区域，短期存在回调风险' : rsi < 30 ? '处于超卖区域，可能迎来反弹' : '处于正常区间'}

• 操作建议：${sentiment === 'bullish' ? '建议逢低买入，止损设在关键支撑位下方' : sentiment === 'bearish' ? '建议保持观望或减仓，等待更好的入场时机' : '建议区间操作，低吸高抛'}
  `.trim();
}

function generateTechnicalAnalysis(
  rsi: number,
  macd: number,
  signal: number,
  sma20: number,
  sma50: number,
  sma200: number,
  currentPrice: number,
  resistance: number,
  support: number
): string {
  const macdStatus = macd > signal ? 'MACD 金叉' : macd < signal ? 'MACD 死叉' : 'MACD 持平';
  const trendStrength = currentPrice > sma20 && sma20 > sma50 ? '强势' : currentPrice < sma20 && sma20 < sma50 ? '弱势' : '震荡';

  return `
• RSI 分析：当前 RSI 为 ${rsi.toFixed(1)}。${rsi > 70 ? 'RSI 超过 70，表明市场可能超买，需警惕回调风险。' : rsi < 30 ? 'RSI 低于 30，表明市场可能超卖，存在反弹机会。' : 'RSI 处于 30-70 的正常区间，市场情绪相对平衡。'}

• MACD 分析：${macdStatus}，MACD 值为 ${macd.toFixed(2)}，信号线为 ${signal.toFixed(2)}。${macd > signal ? '短期动能偏强，有利于价格上行。' : '短期动能偏弱，可能继续调整。'}

• 均线系统：
  - 20日均线：$${sma20.toFixed(2)}${currentPrice > sma20 ? '（价格在上方，短期支撑）' : '（价格在下方，短期阻力）'}
  - 50日均线：$${sma50.toFixed(2)}${currentPrice > sma50 ? '（价格在上方，中期支撑）' : '（价格在下方，中期阻力）'}
  - 200日均线：$${sma200.toFixed(2)}${currentPrice > sma200 ? '（价格在上方，长期牛市）' : '（价格在下方，长期熊市）'}

  均线排列呈${trendStrength}形态。

• 关键技术位：
  - 阻力位：$${resistance.toFixed(2)}（布林带上轨）
  - 支撑位：$${support.toFixed(2)}（布林带下轨）
  `.trim();
}

function generateFundamentalAnalysis(symbol: string, sentiment: string, fundamentals: FundamentalData): string {
  if (!fundamentals || Object.keys(fundamentals).length === 0) {
    return `
基于技术分析的当前${sentiment === 'bullish' ? '看涨' : sentiment === 'bearish' ? '看跌' : '中性'}信号，建议结合以下基本面因素：

• 行业趋势：关注 ${symbol} 所在行业的整体发展趋势和政策环境。强势行业往往能为个股提供更好的上涨动力。

• 财务健康：建议查看公司最新的财报数据，包括营收增长率、利润率、现金流等核心指标。健康的财务状况是股价上涨的基础。

• 估值水平：对比同行业公司的市盈率（P/E）、市净率（P/B）等估值指标，判断当前价格是否合理。

• 市场情绪：关注机构持仓变化、分析师评级调整等，了解市场主流资金的态度。

注：本分析为纯技术分析，具体基本面数据需要进一步研究。
    `.trim();
  }

  const parts: string[] = [];

  // 公司基本信息
  if (fundamentals.sector || fundamentals.industry) {
    parts.push(`• 公司概况：${symbol} ${fundamentals.sector ? `属于${fundamentals.sector}板块` : ''}${fundamentals.industry ? `，细分行业为${fundamentals.industry}` : ''}。${fundamentals.marketCap ? `当前市值 $${(fundamentals.marketCap / 1e9).toFixed(2)}B。` : ''}`);
  }

  // 估值分析
  const valuationParts: string[] = [];
  if (fundamentals.peRatio !== undefined) {
    const peStatus = fundamentals.peRatio > 30 ? '估值较高' : fundamentals.peRatio < 15 ? '估值较低' : '估值合理';
    valuationParts.push(`市盈率 ${fundamentals.peRatio.toFixed(2)}（${peStatus}）`);
  }
  if (fundamentals.priceToBook !== undefined) {
    const pbStatus = fundamentals.priceToBook > 3 ? '相对账面价值偏高' : fundamentals.priceToBook < 1 ? '可能被低估' : '基本合理';
    valuationParts.push(`市净率 ${fundamentals.priceToBook.toFixed(2)}（${pbStatus}）`);
  }
  if (fundamentals.pegRatio !== undefined) {
    const pegStatus = fundamentals.pegRatio < 1 ? '相对增长率被低估' : fundamentals.pegRatio > 2 ? '可能高估' : '增长与估值匹配';
    valuationParts.push(`PEG比率 ${fundamentals.pegRatio.toFixed(2)}（${pegStatus}）`);
  }
  if (valuationParts.length > 0) {
    parts.push(`• 估值分析：${valuationParts.join('，')}。${fundamentals.targetMeanPrice ? `分析师平均目标价 $${fundamentals.targetMeanPrice.toFixed(2)}。` : ''}`);
  }

  // 盈利能力
  const profitParts: string[] = [];
  if (fundamentals.revenue !== undefined) {
    profitParts.push(`年营收 $${(fundamentals.revenue / 1e9).toFixed(2)}B`);
  }
  if (fundamentals.profitMargin !== undefined) {
    const marginStatus = fundamentals.profitMargin > 20 ? '净利润率优秀' : fundamentals.profitMargin < 5 ? '盈利能力较弱' : '盈利能力良好';
    profitParts.push(`净利润率 ${fundamentals.profitMargin.toFixed(2)}%（${marginStatus}）`);
  }
  if (fundamentals.returnOnEquity !== undefined) {
    const roeStatus = fundamentals.returnOnEquity > 15 ? 'ROE表现优秀' : fundamentals.returnOnEquity < 8 ? 'ROE偏低' : 'ROE适中';
    profitParts.push(`${roeStatus}（${fundamentals.returnOnEquity.toFixed(2)}%）`);
  }
  if (profitParts.length > 0) {
    parts.push(`• 盈利能力：${profitParts.join('，')}。`);
  }

  // 财务健康
  const healthParts: string[] = [];
  if (fundamentals.currentRatio !== undefined) {
    const liquidityStatus = fundamentals.currentRatio > 2 ? '流动性充足' : fundamentals.currentRatio < 1 ? '短期偿债压力较大' : '流动性正常';
    healthParts.push(`流动比率 ${fundamentals.currentRatio.toFixed(2)}（${liquidityStatus}）`);
  }
  if (fundamentals.debtToEquity !== undefined) {
    const leverageStatus = fundamentals.debtToEquity > 2 ? '负债率偏高' : fundamentals.debtToEquity < 0.5 ? '财务杠杆保守' : '负债率适中';
    healthParts.push(`负债权益比 ${fundamentals.debtToEquity.toFixed(2)}（${leverageStatus}）`);
  }
  if (healthParts.length > 0) {
    parts.push(`• 财务健康：${healthParts.join('，')}。`);
  }

  // 市场表现
  const marketParts: string[] = [];
  if (fundamentals.beta !== undefined) {
    const betaDesc = fundamentals.beta > 1.5 ? '波动性较高，风险较大' : fundamentals.beta < 0.8 ? '相对稳定，防御性强' : '波动性适中';
    marketParts.push(`Beta系数 ${fundamentals.beta.toFixed(2)}（${betaDesc}）`);
  }
  if (fundamentals.dividendYield !== undefined && fundamentals.dividendYield > 0) {
    marketParts.push(`股息率 ${fundamentals.dividendYield.toFixed(2)}%`);
  }
  if (fundamentals.recommendationKey) {
    const recMap: { [key: string]: string } = {
      'strong_buy': '强烈买入',
      'buy': '买入',
      'hold': '持有',
      'sell': '卖出',
      'strong_sell': '强烈卖出'
    };
    const recChinese = recMap[fundamentals.recommendationKey.toLowerCase()] || fundamentals.recommendationKey;
    marketParts.push(`分析师评级：${recChinese}`);
  }
  if (marketParts.length > 0) {
    parts.push(`• 市场表现：${marketParts.join('，')}。`);
  }

  if (parts.length === 0) {
    parts.push('基本面数据暂时无法获取，建议结合公司财报和行业研究进行分析。');
  }

  return parts.join('\n\n');
}

function generateRiskWarning(sentiment: string, rsi: number, changePercent: number): string {
  const risks: string[] = [];

  risks.push('• 技术分析局限性：技术指标仅反映历史价格走势，不能完全预测未来走向。市场可能因突发消息出现与技术面相反的走势。');

  if (sentiment === 'bullish') {
    risks.push('• 追高风险：当前技术面偏多，但若在高位追涨，可能面临短期回调风险。建议控制仓位，设置止损。');
  } else if (sentiment === 'bearish') {
    risks.push('• 抄底风险：虽然技术面偏弱，但盲目抄底可能遭遇继续下跌。建议等待明确的反转信号。');
  }

  if (rsi > 70) {
    risks.push('• 超买风险：RSI 显示超买状态，短期内可能出现技术性回调，不宜追高。');
  } else if (rsi < 30) {
    risks.push('• 破位风险：RSI 显示超卖状态，但需警惕进一步破位下跌，建议分批建仓。');
  }

  if (Math.abs(changePercent) > 5) {
    risks.push(`• 波动风险：近期股价波动较大（${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%），市场情绪不稳定，需做好风险控制。`);
  }

  risks.push('• 系统性风险：需关注大盘整体走势、宏观经济数据、利率变化等系统性风险因素。');

  risks.push('• 黑天鹅事件：突发的公司负面新闻、行业政策变化等不可预测事件可能导致股价剧烈波动。');

  return risks.join('\n\n');
}
