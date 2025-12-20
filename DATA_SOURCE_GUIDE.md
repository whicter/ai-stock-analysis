# 📊 数据源选择指南

## 🎯 现在可以选择数据源了！

在界面上输入股票代码后，你可以选择从哪里获取股票数据：

```
┌─────────────────────────────────────────┐
│ 🌐 Yahoo Finance    📈 Alpha Vantage   │
│   免费无限制           API限制           │
└─────────────────────────────────────────┘
```

## 📊 数据源对比

| 特性 | Yahoo Finance | Alpha Vantage |
|------|--------------|---------------|
| **价格** | 完全免费 | 免费（有限制） |
| **API 密钥** | ❌ 不需要 | ✅ 需要 |
| **请求限制** | ✅ 无限制 | ⚠️ 每分钟5次，每天100次 |
| **数据质量** | 优秀 | 优秀 |
| **响应速度** | 快 | 中等 |
| **覆盖范围** | 全球股票 | 美股为主 |
| **历史数据** | ✅ 完整 | ✅ 完整 |
| **技术指标** | ✅ 支持 | ✅ 支持 |

## 🆓 Yahoo Finance（推荐）

### 优势
- ✅ **完全免费** - 无需任何 API 密钥
- ✅ **无限制** - 想查多少次就查多少次
- ✅ **速度快** - 直接获取数据
- ✅ **数据可靠** - Yahoo Finance 是知名金融数据提供商

### 劣势
- ❌ 几乎没有劣势

### 适用场景
- 日常使用
- 频繁查询多只股票
- 不想申请 API 密钥
- 任何情况下都推荐首选

## 📈 Alpha Vantage

### 优势
- ✅ **官方 API** - 专业的股票数据 API
- ✅ **文档完善** - 技术指标计算精确
- ✅ **数据格式规范** - 标准化的数据结构

### 劣势
- ❌ **需要 API 密钥** - 需要注册获取
- ❌ **有使用限制** - 免费版每分钟5次，每天100次
- ❌ **容易达到限制** - 频繁使用会被限流

### 适用场景
- 需要特定的 API 格式
- 已经有 Alpha Vantage 订阅
- 作为 Yahoo Finance 的备份

## 💡 使用建议

### 推荐策略

```
主要使用 → 🌐 Yahoo Finance（免费无限）
备用选择 → 📈 Alpha Vantage（达到限制时）
```

### 典型工作流

**日常使用**：
1. 选择 Yahoo Finance
2. 随意查询任意数量股票
3. 无需担心限制

**Alpha Vantage 达到限制时**：
```
错误: API rate limit exceeded
↓
切换到 Yahoo Finance
↓
继续正常使用
```

## 🔧 配置说明

### Yahoo Finance（无需配置）

Yahoo Finance **不需要任何配置**，开箱即用！
```env
# .env 文件中无需设置
# Yahoo Finance 自动工作
```

### Alpha Vantage（需要 API 密钥）

如果想使用 Alpha Vantage：

1. **获取 API 密钥**
   - 访问：https://www.alphavantage.co/support/#api-key
   - 填写邮箱
   - 复制密钥

2. **添加到 .env**
   ```env
   ALPHA_VANTAGE_API_KEY=你的密钥
   ```

3. **在界面选择**
   - 选择 "📈 Alpha Vantage"
   - 点击启动分析

## 📊 数据质量对比

两个数据源提供的数据质量都很高：

### 股票报价
- ✅ 当前价格
- ✅ 涨跌幅
- ✅ 最高/最低价
- ✅ 成交量
- ✅ 开盘价

### 历史数据
- ✅ 100+ 天历史数据
- ✅ OHLCV (开高低收量)
- ✅ 日线数据

### 技术指标
- ✅ RSI
- ✅ MACD
- ✅ 移动平均线 (SMA20, SMA50, SMA200)
- ✅ 布林带

**结论**: 两个数据源的分析结果完全一致！

## ⚡ 性能对比

### Yahoo Finance
```
查询速度: ⚡⚡⚡ 极快（1-2秒）
数据获取: 直接从 Yahoo Finance API
技术指标: 本地计算
```

### Alpha Vantage
```
查询速度: ⚡⚡ 中等（2-4秒）
数据获取: Alpha Vantage API（可能有延迟）
技术指标: 本地计算
```

## 🎯 常见场景

### 场景1：快速分析多只股票
```
选择: Yahoo Finance
原因: 无限制，速度快
```

### 场景2：达到 Alpha Vantage 限制
```
错误提示: API rate limit exceeded
解决方案: 切换到 Yahoo Finance
```

### 场景3：对比数据源
```
1. 用 Yahoo Finance 分析 TSLA
2. 用 Alpha Vantage 分析 TSLA
3. 对比结果（应该一致）
```

### 场景4：企业使用
```
推荐: Yahoo Finance
原因: 无 API 成本，无限制
```

## ❓ 常见问题

**Q: Yahoo Finance 数据准确吗？**
A: 非常准确，Yahoo Finance 是全球知名的金融数据提供商

**Q: 为什么还要 Alpha Vantage？**
A: 作为备选方案，某些用户可能有特殊需求或已有订阅

**Q: 两个数据源结果会不同吗？**
A: 不会，技术分析结果应该一致（基于相同的计算方法）

**Q: 可以同时用两个数据源吗？**
A: 不可以同时，但可以随时切换

**Q: Yahoo Finance 需要注册吗？**
A: 不需要，完全开箱即用

**Q: Alpha Vantage 免费版够用吗？**
A: 如果查询频率不高可以，但 Yahoo Finance 更推荐

## 🔄 如何切换数据源

### 在界面切换
1. 输入股票代码
2. 点击选择数据源（Yahoo Finance 或 Alpha Vantage）
3. 选择 AI 引擎
4. 点击"启动分析"

### 默认设置
在 `backend/.env` 文件中：
```env
# 默认数据源（推荐 yahoo-finance）
DATA_SOURCE=yahoo-finance
```

## 📈 最佳实践

1. **首选 Yahoo Finance**
   - 速度快，无限制，免费

2. **备选 Alpha Vantage**
   - 仅在有特殊需求时使用

3. **监控使用**
   - 如果用 Alpha Vantage，注意请求限制

4. **灵活切换**
   - 根据需要在界面随时切换

---

**推荐配置**：默认使用 Yahoo Finance，享受无限制的免费股票分析！🎉
