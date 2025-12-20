import React from 'react';
import './TechnicalPoints.css';

interface TechnicalPointsProps {
  points: {
    strength: number;
    priceRange: { min: number; max: number; label: string };
    resistance: { level: number; label: string };
    support: { level: number; label: string };
    momentum: { value: number; label: string };
    fibonacci?: {
      type: 'extension' | 'retracement';
      levels: {
        level: number;
        price: number;
        label: string;
      }[];
    };
  };
}

const TechnicalPoints: React.FC<TechnicalPointsProps> = ({ points }) => {
  const getStrengthColor = (strength: number) => {
    if (strength < 30) return '#10B981'; // Oversold - green
    if (strength > 70) return '#EF4444'; // Overbought - red
    return '#F59E0B'; // Neutral - amber
  };

  const getStrengthLabel = (strength: number) => {
    if (strength < 30) return '历史新低/弱支撑';
    if (strength > 70) return '前期密集区';
    return '震荡区间';
  };

  return (
    <div className="technical-points">
      <div className="technical-header">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 3L3 10L10 17L17 10L10 3Z" fill="#FFD700"/>
        </svg>
        <h3>技术点位识别</h3>
      </div>

      <div className="points-grid">
        <div className="point-card">
          <div className="point-label">强力区间识别</div>
          <div className="point-value" style={{ color: getStrengthColor(points.strength) }}>
            ${points.priceRange.min.toFixed(2)} ~ ${points.priceRange.max.toFixed(2)}
          </div>
          <div className="point-sublabel" style={{ color: getStrengthColor(points.strength) }}>
            ({getStrengthLabel(points.strength)})
          </div>
        </div>

        <div className="point-card">
          <div className="point-label">筹码密集区(POC)</div>
          <div className="point-value" style={{ color: '#F59E0B' }}>
            ${points.priceRange.max.toFixed(2)}
          </div>
          <div className="point-sublabel" style={{ color: '#F59E0B' }}>
            ({points.priceRange.label})
          </div>
        </div>

        <div className="point-card">
          <div className="point-label">阻力位(上涨压力)</div>
          <div className="point-value" style={{ color: '#EF4444' }}>
            ${points.resistance.level.toFixed(2)}
          </div>
          <div className="point-sublabel" style={{ color: '#EF4444' }}>
            ({points.resistance.label})
          </div>
        </div>

        <div className="point-card">
          <div className="point-label">支撑位(下跌支撑)</div>
          <div className="point-value" style={{ color: '#10B981' }}>
            ${points.support.level.toFixed(2)}
          </div>
          <div className="point-sublabel" style={{ color: '#10B981' }}>
            ({points.support.label})
          </div>
        </div>

        <div className="point-card">
          <div className="point-label">
            市场动能(RSI)
            <span className="info-tooltip">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7 10V7M7 4H7.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="tooltip-text">
                相对强弱指数(RSI)是衡量市场动能的指标，范围0-100。
                <br/><br/>
                • RSI &lt; 30: 超卖区域，可能反弹
                <br/>
                • RSI 30-70: 正常区间
                <br/>
                • RSI &gt; 70: 超买区域，可能回调
              </span>
            </span>
          </div>
          <div className="point-value" style={{ color: '#60A5FA' }}>
            {points.momentum.value.toFixed(1)}
          </div>
          <div className="point-sublabel" style={{ color: '#60A5FA' }}>
            ({points.momentum.label})
          </div>
        </div>
      </div>

      {points.fibonacci && (
        <div className="fibonacci-section">
          <div className="fibonacci-header">
            <div className="fibonacci-title">
              {points.fibonacci.type === 'extension' ? '📈 Fibonacci扩展位 (多头趋势)' : '📉 Fibonacci回撤位 (空头趋势)'}
            </div>
          </div>
          <div className="fibonacci-levels">
            {points.fibonacci.levels.filter(level => level.level > 0).map((level, index) => (
              <div key={index} className="fib-level-item">
                <span className="fib-level-label">{level.label}:</span>
                <span className="fib-level-price" style={{ color: '#FFD700' }}>
                  ${level.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="info-badge">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 11V8M8 5H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span>基于过去价格走势及其波动率指标综合判断</span>
      </div>
    </div>
  );
};

export default TechnicalPoints;
