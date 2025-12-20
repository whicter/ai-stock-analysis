import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeStock } from './services/stockAnalysis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Stock analysis endpoint
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { symbol, provider, dataSource, model } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: '股票代码不能为空' });
    }

    // Validate provider if specified
    const validProviders = ['rule-based', 'claude', 'openai'];
    const selectedProvider = provider && validProviders.includes(provider)
      ? provider
      : process.env.AI_PROVIDER || 'rule-based';

    // Validate data source if specified
    const validDataSources = ['alpha-vantage', 'yahoo-finance'];
    const selectedDataSource = dataSource && validDataSources.includes(dataSource)
      ? dataSource
      : process.env.DATA_SOURCE || 'yahoo-finance';

    console.log(`Analyzing stock: ${symbol} with provider: ${selectedProvider}, data source: ${selectedDataSource}, model: ${model || 'default'}`);
    const analysis = await analyzeStock(symbol.toUpperCase(), selectedProvider, selectedDataSource, model);

    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: '分析失败，请稍后重试',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// AI Chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { symbol, provider, model, message, conversationHistory } = req.body;

    if (!symbol || !message) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    if (provider === 'rule-based') {
      return res.status(400).json({ error: '规则分析不支持对话功能' });
    }

    // Import chat service
    const { handleChat } = await import('./services/chatService');

    const response = await handleChat(symbol, provider, model, message, conversationHistory || []);

    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: '对话失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
