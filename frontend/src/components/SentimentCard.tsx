import React from 'react';
import './SentimentCard.css';

interface SentimentCardProps {
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

const SentimentCard: React.FC<SentimentCardProps> = ({ sentiment }) => {
  const getSentimentConfig = () => {
    switch (sentiment) {
      case 'bullish':
        return {
          icon: (
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <path d="M20 60L40 20L60 60" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M30 45L50 45" stroke="#10B981" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          ),
          label: '多头',
          subtitle: '当前主要趋势',
          color: '#10B981',
          bgColor: 'rgba(16, 185, 129, 0.1)',
          description: '基于技术指标分析当前趋势向好，建议关注',
        };
      case 'bearish':
        return {
          icon: (
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <path d="M20 20L40 60L60 20" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M30 35L50 35" stroke="#EF4444" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          ),
          label: '空头',
          subtitle: '当前主要趋势',
          color: '#EF4444',
          bgColor: 'rgba(239, 68, 68, 0.1)',
          description: '基于技术指标分析当前趋势承压，谨慎观望',
        };
      case 'neutral':
        return {
          icon: (
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <path d="M20 40L40 20L40 60L60 40" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          label: '震荡',
          subtitle: '当前主要趋势',
          color: '#F59E0B',
          bgColor: 'rgba(245, 158, 11, 0.1)',
          description: '基于技术指标分析当前趋势震荡，区间操作',
        };
    }
  };

  const config = getSentimentConfig();

  return (
    <div className="sentiment-card" style={{ borderColor: config.color + '40' }}>
      <div className="sentiment-icon" style={{ background: config.bgColor }}>
        {config.icon}
      </div>
      <div className="sentiment-content">
        <div className="sentiment-subtitle">{config.subtitle}</div>
        <div className="sentiment-label" style={{ color: config.color }}>
          {config.label}
        </div>
        <div className="sentiment-description">{config.description}</div>
      </div>
    </div>
  );
};

export default SentimentCard;
