import React, { useState } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onAnalyze: (symbol: string, provider: string, dataSource: string, model?: string) => void;
  loading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onAnalyze, loading }) => {
  const [symbol, setSymbol] = useState('');
  const [provider, setProvider] = useState('rule-based');
  const [dataSource, setDataSource] = useState('yahoo-finance');
  const [model, setModel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim() && !loading) {
      onAnalyze(symbol.trim().toUpperCase(), provider, dataSource, model);
    }
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit}>
        <div className="search-input-container">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            placeholder="输入股票代码，例如: TSLA, AAPL, NVDA"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            disabled={loading}
            className="search-input"
          />
        </div>
        <div className="data-source-selection">
          <label className="data-source-label">数据源:</label>
          <div className="data-source-options">
            <button
              type="button"
              className={`data-source-btn ${dataSource === 'yahoo-finance' ? 'active' : ''}`}
              onClick={() => setDataSource('yahoo-finance')}
              disabled={loading}
            >
              <span className="data-source-icon">🌐</span>
              <span className="data-source-name">Yahoo Finance</span>
              <span className="data-source-tag">免费无限制</span>
            </button>
            <button
              type="button"
              className={`data-source-btn ${dataSource === 'alpha-vantage' ? 'active' : ''}`}
              onClick={() => setDataSource('alpha-vantage')}
              disabled={loading}
            >
              <span className="data-source-icon">📈</span>
              <span className="data-source-name">Alpha Vantage</span>
              <span className="data-source-tag">API限制</span>
            </button>
          </div>
        </div>
        <div className="provider-selection">
          <label className="provider-label">分析引擎:</label>
          <div className="provider-options">
            <button
              type="button"
              className={`provider-btn ${provider === 'rule-based' ? 'active' : ''}`}
              onClick={() => { setProvider('rule-based'); setModel(''); }}
              disabled={loading}
            >
              <span className="provider-icon">📊</span>
              <span className="provider-name">规则分析</span>
              <span className="provider-tag">免费</span>
            </button>
            <button
              type="button"
              className={`provider-btn ${provider === 'claude' ? 'active' : ''}`}
              onClick={() => { setProvider('claude'); setModel('claude-sonnet-4-5-20251101'); }}
              disabled={loading}
            >
              <span className="provider-icon">🤖</span>
              <span className="provider-name">Claude AI</span>
              <span className="provider-tag">专业</span>
            </button>
            <button
              type="button"
              className={`provider-btn ${provider === 'openai' ? 'active' : ''}`}
              onClick={() => { setProvider('openai'); setModel('gpt-4o'); }}
              disabled={loading}
            >
              <span className="provider-icon">🚀</span>
              <span className="provider-name">GPT-4/GPT-5</span>
              <span className="provider-tag">智能</span>
            </button>
          </div>
        </div>
        {(provider === 'claude' || provider === 'openai') && (
          <div className="model-selection">
            <label className="model-label">模型选择:</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={loading}
              className="model-select"
            >
              {provider === 'claude' && (
                <>
                  <option value="claude-sonnet-4-5-20251101">Claude 4.5 Sonnet (推荐)</option>
                  <option value="claude-opus-4-20250514">Claude 4 Opus</option>
                  <option value="claude-sonnet-4-20250514">Claude 4 Sonnet</option>
                  <option value="claude-3-7-sonnet-20250219">Claude 3.7 Sonnet</option>
                  <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                  <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                  <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                </>
              )}
              {provider === 'openai' && (
                <>
                  <option value="gpt-4o">GPT-4o (推荐)</option>
                  <option value="gpt-5">GPT-5</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </>
              )}
            </select>
          </div>
        )}
        <div className="button-group">
          <button type="submit" className="btn-primary" disabled={loading || !symbol.trim()}>
            ⚡ 启动分析
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
