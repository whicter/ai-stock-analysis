# 📊 AI Stock Analysis Platform

<div align="center">

**A Professional Stock Analysis System Powered by AI**

Advanced artificial intelligence for deep technical analysis and investment insights

[Features](#-features) • [Quick Start](#-quick-start) • [User Guide](#-user-guide) • [API Docs](#-api-documentation)

</div>

---

## ✨ Features

### 🤖 AI-Powered Intelligent Analysis
- **Multiple AI Providers**: Claude AI, OpenAI GPT-4/GPT-5, or rule-based analysis (freely switchable)
- **Professional Investment Reports**: Auto-generated comprehensive reports with core insights, technical analysis, fundamentals, and risk warnings
- **Smart Trend Detection**: Automatically identifies bullish, bearish, or neutral market trends
- **Flexible Configuration**: Choose the analysis engine that fits your budget and needs

### 📈 Comprehensive Technical Analysis
- **RSI (Relative Strength Index)**: Identify overbought/oversold zones
- **MACD**: Capture trend changes and momentum
- **Moving Average System**: SMA20, SMA50, SMA200
- **Bollinger Bands**: Price volatility ranges and breakout signals
- **Support/Resistance Levels**: Intelligent identification of key technical levels

### 📊 Multi-Source Data Support
- **Yahoo Finance**: Free unlimited API calls, real-time data (Recommended)
- **Alpha Vantage**: Alternative data source (with API limits)
- **Dynamic Switching**: Select data source from UI
- **Comprehensive Coverage**: All US-listed stocks supported

### 💬 Interactive AI Chat
- **Real-time Q&A**: Ask questions about the analysis
- **Context-Aware**: AI responds based on actual technical data
- **Collapsible Sidebar**: Modern chat interface on the right side
- **Model Selection**: Choose specific Claude or GPT models

### 🎨 Modern User Interface
- **Bilingual Support**: Chinese and English interfaces
- **Responsive Design**: Perfect on desktop and mobile
- **Dark Theme**: Professional investment research style
- **Smooth Animations**: Modern interactive experience

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Description |
|------------|---------|-------------|
| React | 18.3.1 | Modern frontend framework |
| TypeScript | 4.9.5 | Type safety |
| Axios | 1.7.9 | HTTP client |
| CSS3 | - | Gradients, animations, Flexbox/Grid |

### Backend
| Technology | Version | Description |
|------------|---------|-------------|
| Node.js | 20+ LTS | JavaScript runtime |
| Express | 4.21.2 | Web framework |
| TypeScript | 5.7.2 | Type safety |
| Anthropic SDK | 0.32.1 | Claude AI integration |
| OpenAI SDK | 4.77.3 | GPT integration |
| yahoo-finance2 | 3.8.3 | Market data |

---

## 🚀 Quick Start

### 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 20+ LTS or 24+ ([Download](https://nodejs.org/))
- **Yarn** package manager ([Install](https://yarnpkg.com/getting-started/install))

**Optional - Based on Your Choices**:
- **Claude API Key** - If using Claude AI ([Get Key](https://console.anthropic.com/))
- **OpenAI API Key** - If using GPT ([Get Key](https://platform.openai.com/api-keys))
- **Alpha Vantage API Key** - If using as data source ([Get Key](https://www.alphavantage.co/support/#api-key))
- **FMP API Key** - If using Financial Modeling Prep ([Get Key](https://financialmodelingprep.com/developer/docs/))
- **No API Key Needed** - If using rule-based analysis with Yahoo Finance

### 🔧 Installation Steps

#### 1️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
yarn install

# Create environment file
cp .env.example .env
```

Edit `backend/.env` file to configure your settings. **You only need to configure the services you plan to use**:

```env
# Data Source (yahoo-finance, fmp, or alpha-vantage)
# Default: yahoo-finance (no API key needed)
DATA_SOURCE=yahoo-finance

# AI Analysis Provider (claude, openai, or rule-based)
# Default: rule-based (no API key required)
AI_PROVIDER=rule-based

# ========== AI Provider API Keys (Optional) ==========
# Only configure the AI provider you want to use

# Claude API Key (only if AI_PROVIDER=claude)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# OpenAI API Key (only if AI_PROVIDER=openai)
OPENAI_API_KEY=sk-proj-xxxxx

# OpenAI Model Selection (optional, default: gpt-4o)
# Supported: gpt-4o, gpt-5, gpt-4-turbo, gpt-4, gpt-3.5-turbo
OPENAI_MODEL=gpt-4o

# ========== Data Source API Keys (Optional) ==========
# Yahoo Finance: No API key needed (recommended)
# Only configure if using FMP or Alpha Vantage

# Financial Modeling Prep API Key (only if DATA_SOURCE=fmp)
FMP_API_KEY=your_fmp_key_here

# Alpha Vantage API Key (only if DATA_SOURCE=alpha-vantage)
ALPHA_VANTAGE_API_KEY=your_av_key_here

# Server Port (optional, default: 3001)
PORT=3001
```

---

### 🔑 API Key Setup Guide

#### **AI Analysis Providers** (Optional - Choose One)

<details>
<summary><strong>Option 1: Rule-Based Analysis (No API Key)</strong> ✅ Recommended for Beginners</summary>

- **Setup**: No configuration needed
- **Cost**: Completely free
- **Features**: Technical analysis based on RSI, MACD, moving averages, Bollinger Bands
- **Pros**: No API costs, instant results
- **Cons**: Less detailed than AI analysis

</details>

<details>
<summary><strong>Option 2: Claude AI</strong> 🤖 Professional Analysis</summary>

**Step 1: Get API Key**
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Go to "API Keys" section
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)

**Step 2: Configure**
```env
AI_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

**Cost**: ~$0.003-$0.015 per analysis ([Pricing](https://www.anthropic.com/pricing))

</details>

<details>
<summary><strong>Option 3: OpenAI GPT</strong> 🚀 Advanced AI</summary>

**Step 1: Get API Key**
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-` or `sk-`)
5. **Important**: Add credits to your account at [Billing](https://platform.openai.com/account/billing)

**Step 2: Configure**
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_MODEL=gpt-4o
```

**Cost**: ~$0.005-$0.02 per analysis ([Pricing](https://openai.com/pricing))

**Note**: ChatGPT Plus subscription ≠ API access. API billing is separate.

</details>

---

#### **Data Source Providers** (Choose One)

<details>
<summary><strong>Option 1: Yahoo Finance (No API Key)</strong> ✅ Recommended</summary>

- **Setup**: No configuration needed
- **Cost**: Completely free
- **Limits**: Unlimited requests
- **Data**: Real-time prices, historical data, basic fundamentals
- **Pros**: No setup, no limits, comprehensive data
- **Cons**: None

```env
DATA_SOURCE=yahoo-finance
# No API key needed
```

</details>

<details>
<summary><strong>Option 2: Financial Modeling Prep (FMP)</strong> 💼 Deep Fundamentals</summary>

**Step 1: Get API Key**
1. Visit [FMP Developer Portal](https://financialmodelingprep.com/developer/docs/)
2. Click "Get your Free API Key"
3. Sign up with email
4. Verify email and log in
5. Find your API key in the dashboard

**Step 2: Configure**
```env
DATA_SOURCE=fmp
FMP_API_KEY=your_actual_fmp_key_here
```

**Free Tier Limits**:
- 250 requests per day
- Full fundamental data (ratios, metrics, cash flow)
- Real-time quotes

**Upgrade**: $14-49/month for higher limits

</details>

<details>
<summary><strong>Option 3: Alpha Vantage</strong> 📈 Alternative Source</summary>

**Step 1: Get API Key**
1. Visit [Alpha Vantage Support](https://www.alphavantage.co/support/#api-key)
2. Enter your email and click "GET FREE API KEY"
3. Check your email for the API key
4. Copy the key

**Step 2: Configure**
```env
DATA_SOURCE=alpha-vantage
ALPHA_VANTAGE_API_KEY=YOUR_KEY_HERE
```

**Free Tier Limits**:
- 5 requests per minute
- 100 requests per day
- Technical indicators included

**Cons**: No fundamental data, strict rate limits

</details>

---

### 💡 Recommended Configurations

**For Testing/Learning** (100% Free):
```env
DATA_SOURCE=yahoo-finance
AI_PROVIDER=rule-based
# No API keys needed
```

**For Professional Use** (Best Quality):
```env
DATA_SOURCE=yahoo-finance  # or fmp for deeper fundamentals
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_MODEL=gpt-4o
```

**For Daily Research** (Budget-Friendly):
```env
DATA_SOURCE=fmp
FMP_API_KEY=xxxxx
AI_PROVIDER=rule-based
# 250 free analyses per day with deep fundamentals
```

#### 2️⃣ Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
yarn install

# (Optional) Create environment file
echo "REACT_APP_API_URL=http://localhost:3001" > .env
```

---

## 🎯 Running the Application

### Development Mode

**Terminal 1 - Start Backend**:
```bash
cd backend
yarn dev
```
✅ Backend runs on `http://localhost:3001`

**Terminal 2 - Start Frontend**:
```bash
cd frontend
yarn start
```
✅ Frontend runs on `http://localhost:3000` (opens automatically in browser)

### Production Mode

```bash
# Build backend
cd backend
yarn build
yarn start

# Build frontend
cd frontend
yarn build
# Serve the build directory with a static server
```

---

## 📖 User Guide

### Basic Usage

1. **Select Data Source**
   - Choose between Yahoo Finance (recommended) or Alpha Vantage

2. **Select Analysis Engine**
   - **Rule-Based**: Free technical analysis
   - **Claude AI**: Professional AI insights
   - **GPT-4/GPT-5**: OpenAI's advanced models

3. **Select Model** (for AI engines)
   - Choose specific model variant for Claude or OpenAI

4. **Enter Stock Symbol**
   - Input US stock ticker (e.g., TSLA, AAPL, NVDA, MSFT)
   - Symbol auto-converts to uppercase

5. **Start Analysis**
   - Click "⚡ Start Analysis" button
   - System will automatically:
     - Fetch real-time stock data
     - Calculate technical indicators
     - Generate AI analysis report

6. **View Results**
   - **Sentiment Card**: Shows current market trend (Bullish/Bearish/Neutral)
   - **Technical Points**: Key price ranges, support, resistance
   - **AI Analysis Report**: Complete report with:
     - Core Investment Thesis
     - Technical Analysis
     - Fundamental Analysis
     - Risk Warnings

### AI Chat Feature

After analysis completes:
1. Look for the collapsible chat panel on the right side
2. Click to expand the interface
3. Ask questions like:
   - "Should I buy this stock now?"
   - "What do the technical indicators suggest?"
   - "What are the key risks?"
   - "Where are the support and resistance levels?"

The AI responds with context-aware answers based on real technical data.

### Example Stock Symbols

| Symbol | Company | Industry |
|--------|---------|----------|
| SPY | SPDR S&P 500 ETF | Index Fund |
| TSLA | Tesla | Electric Vehicles |
| AAPL | Apple | Technology |
| NVDA | NVIDIA | AI/Chips |
| MSFT | Microsoft | Technology |
| AMZN | Amazon | E-commerce/Cloud |
| GOOGL | Google | Technology |
| META | Meta | Social Media |

---

## 📁 Project Structure

```
ai-stock-analysis/
├── 📂 backend/                      # Backend service
│   ├── 📂 src/
│   │   ├── 📄 index.ts             # Express server entry
│   │   └── 📂 services/
│   │       ├── 📄 alphaVantage.ts      # Alpha Vantage data + indicators
│   │       ├── 📄 yahooFinance.ts      # Yahoo Finance data
│   │       ├── 📄 claudeService.ts     # Claude AI service
│   │       ├── 📄 openaiService.ts     # OpenAI service
│   │       ├── 📄 ruleBasedService.ts  # Rule-based analysis
│   │       ├── 📄 chatService.ts       # AI chat service
│   │       └── 📄 stockAnalysis.ts     # Core analysis logic
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   └── 📄 .env.example             # Environment template
│
├── 📂 frontend/                     # Frontend app
│   ├── 📂 public/
│   │   └── 📄 index.html
│   ├── 📂 src/
│   │   ├── 📂 components/          # React components
│   │   │   ├── 📄 SearchBar.tsx         # Search bar & settings
│   │   │   ├── 📄 SentimentCard.tsx     # Sentiment display
│   │   │   ├── 📄 TechnicalPoints.tsx   # Technical indicators
│   │   │   ├── 📄 AnalysisReport.tsx    # Analysis report
│   │   │   └── 📄 AIChat.tsx            # Chat interface
│   │   ├── 📂 services/
│   │   │   └── 📄 api.ts           # API calls
│   │   ├── 📄 App.tsx              # Main app component
│   │   ├── 📄 index.tsx            # App entry
│   │   └── 📄 types.ts             # TypeScript types
│   ├── 📄 package.json
│   └── 📄 tsconfig.json
│
├── 📄 README.md                     # Documentation (Chinese)
├── 📄 README_EN.md                  # Documentation (English)
└── 📄 .gitignore                   # Git ignore file
```

---

## 🔌 API Documentation

### Backend API Endpoints

#### `POST /api/analyze`

Analyze a stock and return comprehensive AI analysis.

**Request Body**:
```json
{
  "symbol": "TSLA",
  "provider": "openai",
  "dataSource": "yahoo-finance",
  "model": "gpt-4o"
}
```

**Response**:
```json
{
  "sentiment": "bullish",
  "technicalPoints": {
    "strength": 45.2,
    "priceRange": { "min": 250.00, "max": 280.00, "label": "Range" },
    "resistance": { "level": 285.50, "label": "Resistance" },
    "support": { "level": 245.00, "label": "Support" },
    "momentum": { "value": 45.2, "label": "Neutral Zone" }
  },
  "report": {
    "title": "TSLA Deep Investment Report",
    "date": "2025-12-20",
    "targetPrice": "$300.00",
    "sections": {
      "coreView": "...",
      "technicalAnalysis": "...",
      "fundamentalAnalysis": "...",
      "riskWarning": "..."
    }
  }
}
```

#### `POST /api/chat`

Interactive AI chat about stock analysis.

**Request Body**:
```json
{
  "symbol": "TSLA",
  "provider": "openai",
  "model": "gpt-4o",
  "message": "Should I buy this stock?",
  "conversationHistory": []
}
```

**Response**:
```json
{
  "response": "Based on the current technical analysis..."
}
```

#### `GET /api/health`

Health check endpoint.

**Response**:
```json
{
  "status": "ok"
}
```

---

## 🤖 AI Provider Comparison

### 1. Rule-Based Analysis 🆓

**Pros**:
- ✅ Completely free, no API key needed
- ✅ Fast response, no API latency
- ✅ Based on proven technical analysis rules
- ❌ Less depth compared to AI analysis
- ❌ Cannot incorporate latest market news

**Use Cases**:
- Learning technical analysis
- Quick technical indicator signals
- Budget-conscious users

**Analysis Includes**:
- RSI, MACD, Moving Average interpretation
- Rule-based trend detection
- Auto-generated support/resistance levels
- Standard risk warnings

### 2. Claude (Anthropic) 🚀

**Pros**:
- ✅ Strong deep analysis capabilities
- ✅ Professional, detailed reports
- ✅ Excellent Chinese language support
- ❌ Paid API (token-based billing)
- ❌ Slightly slower response (10-20s)

**Use Cases**:
- Professional investment reports needed
- High-quality analysis required
- Willing to pay for better insights

**Cost Reference**:
- Sonnet model: ~$0.003 - $0.015 per analysis
- See [Anthropic Pricing](https://www.anthropic.com/pricing)

**Available Models**:
- Claude 4.5 Sonnet (Recommended)
- Claude 4 Opus
- Claude 3.7 Sonnet
- Claude 3.5 Sonnet
- And more...

### 3. OpenAI (GPT-4/GPT-5) 🎯

**Pros**:
- ✅ Broad knowledge base
- ✅ Mature, stable API
- ✅ Multiple model options (GPT-4o, GPT-5, GPT-4-turbo, etc.)
- ✅ Can configure latest GPT-5 or future models
- ❌ Paid API (token-based billing)
- ❌ Chinese analysis not as natural as Claude

**Use Cases**:
- Already have OpenAI API subscription
- Need multi-language support
- Prefer GPT model series
- Want to use latest GPT-5

**Cost Reference**:
- GPT-4o: ~$0.005 - $0.02 per analysis
- GPT-4-turbo: ~$0.01 - $0.03 per analysis
- See [OpenAI Pricing](https://openai.com/pricing)

**Model Configuration**:
Set `OPENAI_MODEL` in `.env`:
- `gpt-4o` (default, recommended)
- `gpt-5` (latest)
- `gpt-4-turbo`
- `gpt-3.5-turbo` (cheaper)
- Any new OpenAI models

### Decision Guide

```
Getting Started → Use rule-based (free)
    ↓
Need Deeper Analysis → Choose Claude or OpenAI
    ↓
Chinese Quality Priority → Claude
English/Multilingual → OpenAI
```

---

## 🔧 Technical Indicators Explained

### RSI (Relative Strength Index)
- **Range**: 0-100
- **Overbought**: > 70 (potential pullback)
- **Oversold**: < 30 (potential bounce)
- **Neutral**: 30-70

### MACD (Moving Average Convergence Divergence)
- **MACD Line**: 12-day EMA - 26-day EMA
- **Signal Line**: 9-day EMA of MACD
- **Histogram**: MACD - Signal Line
- **Bullish Crossover**: MACD crosses above signal line
- **Bearish Crossover**: MACD crosses below signal line

### Moving Averages (SMA)
- **SMA20**: Short-term trend
- **SMA50**: Medium-term trend
- **SMA200**: Long-term trend
- **Golden Cross**: Short MA crosses above long MA (bullish)
- **Death Cross**: Short MA crosses below long MA (bearish)

### Bollinger Bands
- **Upper Band**: SMA20 + 2σ
- **Middle Band**: SMA20
- **Lower Band**: SMA20 - 2σ
- **Above Upper**: Potentially overbought
- **Below Lower**: Potentially oversold

---

## ⚠️ API Usage Limits

### Alpha Vantage Free Tier
- ⏱️ **Rate**: Max 5 requests per minute
- 📅 **Daily**: Max 100 requests per day
- 📊 **Data**: Last 100 data points

**Recommendations**:
- Avoid frequent refreshing
- Implement caching
- Upgrade to paid tier for higher limits

### Yahoo Finance
- ✅ **Free**: No API key needed
- ✅ **Unlimited**: No rate limits
- ✅ **Real-time**: Latest market data

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Invalid Stock Symbol or API Limit"
**Cause**: Alpha Vantage rate limit or incorrect symbol

**Solutions**:
- Verify stock symbol is correct (must be US ticker)
- Wait 1 minute and retry
- Check API key validity
- Switch to Yahoo Finance data source

#### 2. "Analysis Failed"
**Cause**: AI API call failed or configuration error

**Solutions**:
- Check API key in `backend/.env`
- Verify API key has sufficient credits
- Check backend console logs for details

#### 3. Frontend Cannot Connect to Backend
**Cause**: CORS or backend not running

**Solutions**:
- Ensure backend is running (`yarn dev`)
- Check if port 3001 is available
- Check firewall settings

#### 4. Dependency Installation Failed
**Cause**: Node.js version too old or network issues

**Solutions**:
```bash
# Upgrade Node.js to 20+
node -v

# Clear yarn cache
yarn cache clean

# Reinstall
rm -rf node_modules yarn.lock
yarn install
```

#### 5. Report Not Displaying
**Cause**: AI response parsing error

**Solutions**:
- Check backend logs for parsing errors
- Try different AI model
- Restart backend server

---

## 🔐 Security Best Practices

1. **Protect API Keys**
   - Never commit `.env` to Git
   - Don't hardcode API keys in frontend
   - Rotate API keys regularly

2. **Production Deployment**
   - Use environment variables for secrets
   - Enable HTTPS
   - Implement rate limiting
   - Add user authentication (if needed)

3. **API Usage**
   - Monitor API usage
   - Implement caching to reduce calls
   - Set request timeouts

---

## 🚧 Roadmap

- [ ] More technical indicators (ATR, Stochastic, etc.)
- [ ] Multi-market support (Hong Kong, A-shares)
- [ ] Data caching mechanism
- [ ] User account system
- [ ] Historical analysis records
- [ ] Real-time price updates (WebSocket)
- [ ] PDF report export
- [ ] Stock comparison feature
- [ ] Mobile app

---

## 📄 Disclaimer

⚠️ **Important Notice**:

This system is for **educational and research purposes only**. All analysis results, recommendations, and predictions **do NOT constitute financial advice**.

- Stock markets involve risks; invest cautiously
- AI analysis is for reference only; accuracy not guaranteed
- Consult professional financial advisors before making investment decisions
- Developers are not liable for any losses incurred from using this system

---

## 📝 License

MIT License

Copyright (c) 2025

---

## 🤝 Contributing

Issues and Pull Requests are welcome!

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Contact

For questions or suggestions:

- Submit a GitHub Issue
- Email: [your-email@example.com]

---

<div align="center">

**⭐ If this project helps you, please give it a Star!**

Made with ❤️ using Claude AI & OpenAI GPT

</div>
