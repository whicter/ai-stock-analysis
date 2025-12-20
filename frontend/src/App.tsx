import React, { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import SentimentCard from './components/SentimentCard';
import TechnicalPoints from './components/TechnicalPoints';
import AnalysisReport from './components/AnalysisReport';
import AIChat from './components/AIChat';
import { analyzeStock } from './services/api';
import { AnalysisResult } from './types';

function App() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [symbol, setSymbol] = useState<string>('');
  const [provider, setProvider] = useState<string>('');
  const [model, setModel] = useState<string>('');

  const handleAnalyze = async (stockSymbol: string, selectedProvider: string, dataSource: string, selectedModel?: string) => {
    setLoading(true);
    setError('');
    setSymbol(stockSymbol);
    setProvider(selectedProvider);
    setModel(selectedModel || '');
    setAnalysis(null);

    try {
      const result = await analyzeStock(stockSymbol, selectedProvider, dataSource, selectedModel);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M8 24L16 8L24 24" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 18H20" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h1>个股智能投研中心</h1>
          </div>
        </div>
      </header>

      <main className="App-main">
        <SearchBar onAnalyze={handleAnalyze} loading={loading} />

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>正在分析 {symbol}...</p>
            <p className="loading-subtitle">AI正在深度分析技术指标和市场趋势</p>
          </div>
        )}

        {analysis && !loading && (
          <>
            <div className="results-grid">
              <SentimentCard sentiment={analysis.sentiment} />
              <TechnicalPoints points={analysis.technicalPoints} />
            </div>

            <AnalysisReport report={analysis.report} symbol={symbol} />

            <AIChat symbol={symbol} provider={provider} model={model} />
          </>
        )}

        {!analysis && !loading && !error && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h2>输入股票代码开始分析</h2>
            <p>支持美股代码，如 TSLA, AAPL, NVDA 等</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
