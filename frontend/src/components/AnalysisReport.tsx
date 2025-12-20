import React from 'react';
import './AnalysisReport.css';

interface AnalysisReportProps {
  symbol: string;
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

const AnalysisReport: React.FC<AnalysisReportProps> = ({ symbol, report }) => {
  // Parse markdown-style bold text (**text** or __text__) and convert to JSX
  const parseMarkdown = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let keyCounter = 0;

    // Match **bold** or __bold__
    const boldRegex = /(\*\*|__)(.*?)\1/g;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Add bold text
      parts.push(<strong key={keyCounter++}>{match[2]}</strong>);
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const formatText = (text: string) => {
    // Split by newlines and preserve original structure
    const lines = text.split('\n').filter(line => line.trim());
    const elements: JSX.Element[] = [];

    // Track if we're currently under a subheading
    let underSubheading = false;

    for (let index = 0; index < lines.length; index++) {
      const trimmedLine = lines[index].trim();
      if (!trimmedLine) continue;

      // 检测是否是section子标题（以**开头和结尾的，或者包含**的）
      const isSubheading = /^\*\*.*\*\*/.test(trimmedLine);

      // 检测是否是section标题（以"："或":"结尾，但不是bullet point）
      const isSectionTitle = !trimmedLine.startsWith('-') && !trimmedLine.startsWith('•') &&
                             (trimmedLine.endsWith('：') || trimmedLine.endsWith(':'));

      // Check if it's a bullet point (starts with - or •)
      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
        const content = trimmedLine.substring(1).trim();

        elements.push(
          <li key={index} className={`report-list-item ${underSubheading ? 'indented' : ''}`}>
            {parseMarkdown(content)}
          </li>
        );
      }
      // Check if it's a numbered list
      else if (/^\d+\./.test(trimmedLine)) {
        const content = trimmedLine.replace(/^\d+\.\s*/, '');
        elements.push(
          <li key={index} className={`report-list-item ${underSubheading ? 'indented' : ''}`}>
            {parseMarkdown(content)}
          </li>
        );
      }
      // Subheading (bold text line)
      else if (isSubheading) {
        underSubheading = true;
        elements.push(
          <p key={index} className="report-subheading">
            {parseMarkdown(trimmedLine)}
          </p>
        );
      }
      // Section title (ends with : or ：)
      else if (isSectionTitle) {
        underSubheading = false; // Reset when we hit a new section title
        elements.push(
          <p key={index} className="report-section-subtitle">
            {parseMarkdown(trimmedLine)}
          </p>
        );
      }
      // Regular paragraph
      else {
        elements.push(
          <p key={index} className={`report-paragraph ${underSubheading ? 'indented' : ''}`}>
            {parseMarkdown(trimmedLine)}
          </p>
        );
      }
    }

    return elements;
  };

  return (
    <div className="analysis-report">
      <div className="report-header">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M6 2H14L18 6V18H6V2Z" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V6H18" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h2>AI 深度研报全文</h2>
      </div>

      <div className="report-content">
        <div className="report-title-section">
          <h3 className="report-main-title">
            {symbol} 深度投资研报
          </h3>
          <div className="report-meta">
            <span>日期: {report.date}</span>
            <span>目标价格: {report.targetPrice}</span>
          </div>
        </div>

        <div className="report-section">
          <div className="section-header">
            <span className="section-number">1</span>
            <h4>核心观点</h4>
          </div>
          <div className="section-content">
            {formatText(report.sections.coreView)}
          </div>
        </div>

        <div className="report-section">
          <div className="section-header">
            <span className="section-number">2</span>
            <h4>技术指标分析</h4>
          </div>
          <div className="section-content">
            {formatText(report.sections.technicalAnalysis)}
          </div>
        </div>

        <div className="report-section">
          <div className="section-header">
            <span className="section-number">3</span>
            <h4>基本面分析</h4>
          </div>
          <div className="section-content">
            {formatText(report.sections.fundamentalAnalysis)}
          </div>
        </div>

        <div className="report-section risk-section">
          <div className="section-header">
            <span className="section-number" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444' }}>4</span>
            <h4>风险提示</h4>
          </div>
          <div className="section-content">
            {formatText(report.sections.riskWarning)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReport;
