# 📊 AI 股票智能投研中心

<div align="center">

**一个基于 Claude AI 的专业股票分析系统**

使用先进的人工智能技术，为投资者提供深度技术分析和投资研报

[功能特点](#-功能特点) • [快速开始](#-快速开始) • [使用指南](#-使用指南) • [API 文档](#-api-文档)

</div>

---

## ✨ 功能特点

### 🤖 AI 驱动的智能分析
- **多 AI 提供商支持**: Claude AI、OpenAI GPT-4/GPT-5，或纯规则分析（可自由切换）
- **专业投研报告**: 自动生成包含核心观点、技术分析、基本面分析和风险提示的完整研报
- **智能趋势判断**: 自动识别多头（看涨）、空头（看跌）或震荡（横盘）市场趋势
- **灵活配置**: 根据预算和需求选择最适合的分析引擎

### 📈 全面的技术分析
- **RSI (相对强弱指数)**: 识别超买超卖区域
- **MACD**: 捕捉趋势变化和动量
- **移动平均线系统**: SMA20、SMA50、SMA200
- **布林带**: 价格波动区间和突破信号
- **支撑位/阻力位**: 智能识别关键技术点位

### 📊 多数据源支持
- **Yahoo Finance**: 免费无限制，实时数据（推荐）
- **Alpha Vantage**: 备选数据源（有API限制）
- **灵活切换**: 前端界面动态选择数据源
- **全面覆盖**: 支持所有美国上市股票

### 🎨 现代化用户界面
- **中文界面**: 完整的中文本地化
- **响应式设计**: 完美适配桌面和移动设备
- **深色主题**: 护眼的专业投研风格
- **流畅动画**: 现代化的交互体验

---

## 🛠️ 技术栈

### 前端
| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.3.1 | 现代化前端框架 |
| TypeScript | 4.9.5 | 类型安全 |
| Axios | 1.7.9 | HTTP 客户端 |
| CSS3 | - | 渐变、动画、Flexbox/Grid |

### 后端
| 技术 | 版本 | 说明 |
|------|------|------|
| Node.js | 16+ | JavaScript 运行时 |
| Express | 4.21.2 | Web 框架 |
| TypeScript | 5.7.2 | 类型安全 |
| Anthropic SDK | 0.32.1 | Claude AI 集成 |
| Axios | 1.7.9 | API 请求 |

---

## 🚀 快速开始

### 📋 前置要求

在开始之前，请确保你已安装：

- **Node.js** 16 或更高版本 ([下载](https://nodejs.org/))
- **Yarn** 包管理器 ([安装](https://yarnpkg.com/getting-started/install))
- **Alpha Vantage API Key** - 必需 ([免费获取](https://www.alphavantage.co/support/#api-key))

**可选 - 根据选择的 AI 提供商**:
- **Claude API Key** - 如果使用 Claude ([获取](https://console.anthropic.com/))
- **OpenAI API Key** - 如果使用 GPT-4 ([获取](https://platform.openai.com/api-keys))
- **无需 API Key** - 如果使用 rule-based 分析

### 🔧 安装步骤

#### 1️⃣ 后端设置

```bash
# 进入后端目录
cd backend

# 安装依赖
yarn install

# 创建环境变量文件
cp .env.example .env
```

编辑 `backend/.env` 文件，配置 AI 分析提供商：

```env
# AI 分析提供商 (可选: claude, openai, rule-based)
# 默认为 rule-based（无需 API 密钥）
AI_PROVIDER=rule-based

# Claude API 密钥 (仅当 AI_PROVIDER=claude 时需要)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# OpenAI API 密钥 (仅当 AI_PROVIDER=openai 时需要)
OPENAI_API_KEY=sk-xxxxx

# OpenAI 模型选择 (可选，默认 gpt-4o)
# 支持: gpt-4o, gpt-4-turbo, gpt-4, gpt-3.5-turbo 或更新模型
OPENAI_MODEL=gpt-4o

# Alpha Vantage API 密钥 (必需 - 用于获取股票数据)
ALPHA_VANTAGE_API_KEY=your_key_here

# 服务器端口 (可选，默认 3001)
PORT=3001
```

**AI 提供商选择**:
- **`rule-based`** (推荐新手): 纯技术指标分析，无需 AI API 密钥，完全免费
- **`claude`**: 使用 Claude AI 生成深度分析报告（需要 Anthropic API 密钥）
- **`openai`**: 使用 GPT-4 生成深度分析报告（需要 OpenAI API 密钥）

#### 2️⃣ 前端设置

```bash
# 进入前端目录
cd ../frontend

# 安装依赖
yarn install

# (可选) 创建环境变量文件
echo "REACT_APP_API_URL=http://localhost:3001" > .env
```

---

## 🎯 运行应用

### 开发模式

**终端 1 - 启动后端**:
```bash
cd backend
yarn dev
```
✅ 后端服务运行在 `http://localhost:3001`

**终端 2 - 启动前端**:
```bash
cd frontend
yarn start
```
✅ 前端应用运行在 `http://localhost:3000` (自动在浏览器打开)

### 生产模式

```bash
# 构建后端
cd backend
yarn build
yarn start

# 构建前端
cd frontend
yarn build
# 使用 serve 或其他静态服务器托管 build 目录
```

---

## 📖 使用指南

### 基本使用流程

1. **输入股票代码**
   - 在搜索框输入美股代码（如：TSLA、AAPL、NVDA、MSFT）
   - 代码会自动转为大写

2. **启动分析**
   - 点击 "⚡ 启动分析" 按钮
   - 系统将自动：
     - 获取实时股票数据
     - 计算技术指标
     - 生成 AI 分析报告

3. **查看结果**
   - **趋势判断卡片**: 显示当前市场趋势（多头/空头/震荡）
   - **技术点位识别**: 展示关键价格区间、支撑位、阻力位
   - **AI 深度研报**: 完整的分析报告，包含：
     - 核心观点
     - 技术指标分析
     - 基本面分析
     - 风险提示

### 示例股票代码

| 股票代码 | 公司名称 | 行业 |
|---------|---------|------|
| TSLA | 特斯拉 | 电动汽车 |
| AAPL | 苹果 | 科技 |
| NVDA | 英伟达 | 芯片/AI |
| MSFT | 微软 | 科技 |
| AMZN | 亚马逊 | 电商/云计算 |
| GOOGL | 谷歌 | 科技 |
| META | Meta | 社交媒体 |

---

## 📁 项目结构

```
ai-stock-analysis/
├── 📂 backend/                    # 后端服务
│   ├── 📂 src/
│   │   ├── 📄 index.ts           # Express 服务器入口
│   │   └── 📂 services/
│   │       ├── 📄 alphaVantage.ts    # 股票数据 API
│   │       ├── 📄 claudeService.ts   # Claude AI 服务
│   │       └── 📄 stockAnalysis.ts   # 核心分析逻辑
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   └── 📄 .env.example           # 环境变量模板
│
├── 📂 frontend/                   # 前端应用
│   ├── 📂 public/
│   │   └── 📄 index.html
│   ├── 📂 src/
│   │   ├── 📂 components/        # React 组件
│   │   │   ├── 📄 SearchBar.tsx       # 搜索栏
│   │   │   ├── 📄 SentimentCard.tsx   # 趋势判断卡片
│   │   │   ├── 📄 TechnicalPoints.tsx # 技术点位
│   │   │   └── 📄 AnalysisReport.tsx  # 分析报告
│   │   ├── 📂 services/
│   │   │   └── 📄 api.ts         # API 调用
│   │   ├── 📄 App.tsx            # 主应用组件
│   │   ├── 📄 index.tsx          # 应用入口
│   │   └── 📄 types.ts           # TypeScript 类型定义
│   ├── 📄 package.json
│   └── 📄 tsconfig.json
│
├── 📄 README.md                   # 项目文档
└── 📄 .gitignore                 # Git 忽略文件
```

---

## 🔌 API 文档

### 后端 API 端点

#### `POST /api/analyze`

分析指定股票并返回完整的 AI 分析报告。

**请求体**:
```json
{
  "symbol": "TSLA"
}
```

**响应**:
```json
{
  "sentiment": "bullish",
  "technicalPoints": {
    "strength": 45.2,
    "priceRange": {
      "min": 250.00,
      "max": 280.00,
      "label": "震荡区间"
    },
    "resistance": {
      "level": 285.50,
      "label": "阻力位"
    },
    "support": {
      "level": 245.00,
      "label": "支撑位"
    },
    "momentum": {
      "value": 45.2,
      "label": "中性区域"
    }
  },
  "report": {
    "title": "TSLA 深度投资研报",
    "date": "2025-12-19",
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

#### `GET /api/health`

健康检查端点。

**响应**:
```json
{
  "status": "ok"
}
```

---

## 🤖 AI 分析提供商对比

系统支持三种分析模式，可通过 `AI_PROVIDER` 环境变量切换：

### 1. Rule-Based (规则分析) 🆓

**特点**:
- ✅ 完全免费，无需任何 AI API 密钥
- ✅ 响应速度快，无 API 调用延迟
- ✅ 基于成熟的技术分析规则
- ❌ 分析深度相对较浅
- ❌ 无法结合最新市场资讯

**适用场景**:
- 初学者学习技术分析
- 需要快速获取技术指标信号
- 预算有限或不想使用付费 API

**分析内容**:
- RSI、MACD、均线等技术指标解读
- 基于规则的趋势判断
- 自动生成支撑位/阻力位
- 标准化的风险提示

### 2. Claude (Anthropic) 🚀

**特点**:
- ✅ 深度分析能力强，理解上下文
- ✅ 生成的报告专业、详细
- ✅ 支持中文分析效果好
- ❌ 需要付费 API（按 token 计费）
- ❌ 响应稍慢（10-20秒）

**适用场景**:
- 需要专业级投资研报
- 要求高质量的中文分析
- 愿意为更好的分析付费

**成本参考**:
- Sonnet 模型：约 $0.003 - $0.015 每次分析
- 详见 [Anthropic 定价](https://www.anthropic.com/pricing)

### 3. OpenAI (GPT-4/GPT-4o/GPT-5) 🎯

**特点**:
- ✅ 知识面广，分析全面
- ✅ 成熟稳定的 API
- ✅ 支持多种模型选择（GPT-4o、GPT-4-turbo、GPT-3.5 等）
- ✅ 可配置使用最新的 GPT-5 或未来模型
- ❌ 需要付费 API（按 token 计费）
- ❌ 中文分析不如 Claude 自然

**适用场景**:
- 已有 OpenAI API 订阅
- 需要多语言支持
- 偏好使用 GPT 系列模型
- 想使用最新的 GPT-5 模型

**成本参考**:
- GPT-4o：约 $0.005 - $0.02 每次分析
- GPT-4-turbo：约 $0.01 - $0.03 每次分析
- 详见 [OpenAI 定价](https://openai.com/pricing)

**模型配置**:
在 `.env` 文件中设置 `OPENAI_MODEL` 使用不同模型：
- `gpt-4o` (默认，推荐)
- `gpt-4-turbo`
- `gpt-4`
- `gpt-3.5-turbo` (更便宜)
- 或任何 OpenAI 发布的新模型（如 GPT-5）

### 如何选择？

```
开始使用 → 用 rule-based（免费）
    ↓
需要更深入分析 → 选择 Claude 或 OpenAI
    ↓
中文分析质量优先 → Claude
英文/多语言优先 → OpenAI
```

### 切换提供商

只需修改 `backend/.env` 文件：

```bash
# 使用免费规则分析
AI_PROVIDER=rule-based

# 使用 Claude
AI_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-xxxxx

# 使用 GPT-4o (或 GPT-5)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxx
OPENAI_MODEL=gpt-4o  # 可改为 gpt-4-turbo, gpt-3.5-turbo 等
```

重启后端服务即可生效。

---

## 🔧 技术指标详解

### RSI (相对强弱指数)
- **范围**: 0-100
- **超买**: > 70 (可能回调)
- **超卖**: < 30 (可能反弹)
- **中性**: 30-70

### MACD (指数平滑异同移动平均线)
- **MACD 线**: 12日EMA - 26日EMA
- **信号线**: MACD 的 9日EMA
- **柱状图**: MACD - 信号线
- **金叉**: MACD 上穿信号线 (看涨)
- **死叉**: MACD 下穿信号线 (看跌)

### 移动平均线 (SMA)
- **SMA20**: 短期趋势
- **SMA50**: 中期趋势
- **SMA200**: 长期趋势
- **黄金交叉**: 短期均线上穿长期均线 (看涨)
- **死亡交叉**: 短期均线下穿长期均线 (看跌)

### 布林带 (Bollinger Bands)
- **上轨**: SMA20 + 2σ
- **中轨**: SMA20
- **下轨**: SMA20 - 2σ
- **突破上轨**: 可能超买
- **突破下轨**: 可能超卖

---

## ⚠️ API 使用限制

### Alpha Vantage 免费版限制
- ⏱️ **频率**: 每分钟最多 5 次请求
- 📅 **总量**: 每天最多 100 次请求
- 📊 **数据**: 最近 100 个数据点

**建议**:
- 为避免超限，请勿频繁刷新同一股票
- 考虑实现缓存机制
- 升级到付费版以提高限额

### Claude API 限制
- 根据你的 Anthropic 账户计划
- 建议使用 Sonnet 模型平衡成本和性能
- 详见 [Anthropic 定价](https://www.anthropic.com/pricing)

---

## 🐛 故障排除

### 常见问题

#### 1. "无效的股票代码或API限制"
**原因**: Alpha Vantage API 限流或股票代码错误

**解决方案**:
- 检查股票代码是否正确（必须是美股代码）
- 等待 1 分钟后重试
- 检查 API Key 是否有效

#### 2. "分析失败，请稍后重试"
**原因**: Claude API 调用失败或配置错误

**解决方案**:
- 检查 `backend/.env` 中的 `ANTHROPIC_API_KEY` 是否正确
- 确认 API Key 有足够的额度
- 查看后端控制台日志了解详细错误

#### 3. 前端无法连接后端
**原因**: CORS 或后端未启动

**解决方案**:
- 确保后端服务正在运行 (`yarn dev`)
- 检查端口 3001 是否被占用
- 检查防火墙设置

#### 4. 依赖安装失败
**原因**: Node.js 版本过低或网络问题

**解决方案**:
```bash
# 升级 Node.js 到 16+
node -v

# 清除 yarn 缓存
yarn cache clean

# 重新安装
rm -rf node_modules yarn.lock
yarn install
```

---

## 🔐 安全建议

1. **保护 API 密钥**
   - 永远不要将 `.env` 文件提交到 Git
   - 不要在前端代码中硬编码 API 密钥
   - 定期轮换 API 密钥

2. **生产环境**
   - 使用环境变量管理敏感信息
   - 启用 HTTPS
   - 实施速率限制
   - 添加用户认证（如需要）

3. **API 使用**
   - 监控 API 使用量
   - 实现缓存减少 API 调用
   - 设置请求超时

---

## 🚧 未来计划

- [ ] 添加更多技术指标（ATR、Stochastic 等）
- [ ] 支持多种股票市场（港股、A股等）
- [ ] 实现数据缓存机制
- [ ] 添加用户账户系统
- [ ] 历史分析记录
- [ ] 实时价格推送（WebSocket）
- [ ] PDF 报告导出
- [ ] 股票对比功能
- [ ] 移动端 App

---

## 📄 免责声明

⚠️ **重要提示**:

本系统仅供**教育和研究目的**使用。所有分析结果、建议和预测均**不构成投资建议**。

- 股票市场存在风险，投资需谨慎
- AI 分析仅供参考，不保证准确性
- 请在做出投资决策前咨询专业的财务顾问
- 使用本系统造成的任何损失，开发者不承担责任

---

## 📝 许可证

MIT License

Copyright (c) 2025

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📧 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 GitHub Issue
- 邮件: [你的邮箱]

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个 Star！**

Made with ❤️ using Claude AI

</div>
