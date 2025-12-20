import React, { useState, useRef, useEffect } from 'react';
import './AIChat.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  symbol: string;
  provider: string;
  model?: string;
}

const AIChat: React.FC<AIChatProps> = ({ symbol, provider, model }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          provider,
          model,
          message: input,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: '抱歉，发生了错误。请稍后重试。',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getProviderName = () => {
    if (provider === 'claude') return 'Claude AI';
    if (provider === 'openai') return 'GPT';
    return 'AI助手';
  };

  if (provider === 'rule-based') {
    return null; // 规则分析不支持对话
  }

  return (
    <div className={`ai-chat ${isExpanded ? 'expanded' : ''}`}>
      <div className="chat-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="chat-header-left">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2C5.58172 2 2 5.58172 2 10C2 11.8919 2.65661 13.6304 3.75868 15.0118L2.87966 17.5997C2.79384 17.8549 3.14509 18.2062 3.40026 18.1203L5.98819 17.2413C7.36963 18.3434 9.10814 19 11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3H10Z" stroke="#FFD700" strokeWidth="1.5"/>
            <circle cx="7" cy="10" r="1" fill="#FFD700"/>
            <circle cx="10" cy="10" r="1" fill="#FFD700"/>
            <circle cx="13" cy="10" r="1" fill="#FFD700"/>
          </svg>
          <h3>与 {getProviderName()} 对话</h3>
          <span className="chat-subtitle">询问关于 {symbol} 的任何问题</span>
        </div>
        <svg
          className={`expand-icon ${isExpanded ? 'rotated' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {isExpanded && (
        <div className="chat-body">
          <div className="messages-container">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <p>💬 你好！我是你的AI分析助手</p>
                <p className="welcome-subtitle">你可以问我关于 {symbol} 的任何问题，例如：</p>
                <ul className="example-questions">
                  <li onClick={() => setInput('这只股票现在可以买入吗？')}>• 这只股票现在可以买入吗？</li>
                  <li onClick={() => setInput('目前的技术指标说明了什么？')}>• 目前的技术指标说明了什么？</li>
                  <li onClick={() => setInput('有哪些风险需要注意？')}>• 有哪些风险需要注意？</li>
                  <li onClick={() => setInput('支撑位和阻力位在哪里？')}>• 支撑位和阻力位在哪里？</li>
                </ul>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content loading-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`询问关于 ${symbol} 的问题...`}
              disabled={loading}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="send-button"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 10L18 2L10 18L9 11L2 10Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;
