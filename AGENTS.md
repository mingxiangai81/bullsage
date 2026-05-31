# AGENTS.md — Masterlens 项目顶层规范

> 本文件是所有 AI Agent 的行为规范。每次开始任务前必须先读这份文件。

---

## 项目简介

**Masterlens** 是一个面向家庭用户的股票查询与投资建议网页应用。  
用户可以输入股票代码，获取详细财务数据、技术分析和 AI 投资建议。

**目标用户**：不懂技术的家庭成员，需要简洁易懂的界面。  
**核心价值**：把复杂的股票信息变成普通人看得懂的语言和建议。

---

## 技术架构

```
masterlens/
├── index.html                  # 前端入口（单页应用）
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI 主程序入口
│   │   ├── config.py           # 配置管理
│   │   ├── routes/             # API 路由
│   │   │   ├── analysis.py     # 股票分析接口
│   │   │   ├── auth.py         # 用户认证
│   │   │   ├── watchlist.py    # 自选股列表
│   │   │   ├── reports.py      # 报告生成
│   │   │   └── payments.py     # 支付接口
│   │   ├── services/           # 业务逻辑层
│   │   │   ├── financial_data.py   # 股票数据获取
│   │   │   ├── gemini_engine.py    # Gemini AI 分析引擎
│   │   │   ├── master_prompts.py   # AI 提示词模板
│   │   │   ├── report_builder.py   # 报告组装
│   │   │   └── stripe_service.py   # Stripe 支付
│   │   └── models/             # 数据模型
│   │       ├── schemas.py      # Pydantic 数据结构
│   │       └── database.py     # 数据库连接
│   ├── requirements.txt
│   └── .env.example
└── docs/
    └── superpowers/
        ├── plans/              # 实施计划文档
        └── specs/              # 设计规格文档
```

**技术栈**：
- 前端：HTML/CSS/JS（单文件，index.html）
- 后端：Python + FastAPI
- AI 引擎：Google Gemini
- 支付：Stripe
- 数据库：Supabase（PostgreSQL）

---

## AI Agent 工作规则

### 🔴 绝对禁止
- **不能删除任何现有文件**，除非用户明确指示删除某个文件
- **不能重构整个项目结构**，只做用户要求的具体改动
- **不能修改 `.env` 或包含真实密钥的文件**
- **不能把 API Key、密码等敏感信息写死在代码里**，必须通过环境变量读取

### 🟡 每次任务开始前必须做
1. 读 `AGENTS.md`（本文件）了解项目背景
2. **先计划再做**：列出打算修改哪些文件、怎么改，确认后再动手
3. 读相关文件，了解现有代码，再动手修改
4. 如果任务不清晰，**先用中文问用户确认**，不盲目执行
5. 有风险的操作（如修改数据库、删除数据）必须**提前说明风险**，等用户确认

### 🟢 工作方式
- **一个对话，一个任务**：每次对话只专注完成一个功能，避免同时改太多东西
- **一个任务，一个 Agent 负责**：每个独立功能由单独的 Agent 完成，避免互相干扰
- **改动要最小化**：只改需要改的地方，不要顺手"优化"不相关的代码
- **每次完成后总结**：用简单中文说明做了什么、改了哪些文件、怎么验证效果、下一步建议

---

## 📱 用户体验规则

- **移动端优先**：所有 UI 设计必须在手机上好用，字要够大、按钮好点、不用横向滚动
- **简洁不堆砌**：优先满足真实用户需求，不要为了"看起来功能多"而加没用的功能
- **用普通语言**：股票数据和建议要用家庭成员听得懂的中文呈现，避免专业术语堆砌

---

## 🔐 安全配置规则

- **所有密钥通过环境变量读取**，统一配置在 `.env` 文件（本地）或服务器环境变量（生产）
- `.env` 文件**不能提交到 Git**（已在 `.gitignore` 中排除）
- 新增 API 密钥时，必须同步更新 `.env.example`（写变量名但不写真实值）
- 前端代码中**绝对不能出现任何密钥**，敏感请求必须经过后端中转

---

## 任务分工参考

| 任务类型 | 负责范围 |
|---------|---------|
| 前端 UI | `index.html` |
| 股票数据 API | `backend/app/services/financial_data.py` + `routes/analysis.py` |
| AI 分析 | `backend/app/services/gemini_engine.py` + `master_prompts.py` |
| 用户认证 | `backend/app/routes/auth.py` + `models/database.py` |
| 支付功能 | `backend/app/services/stripe_service.py` + `routes/payments.py` |
| 报告生成 | `backend/app/services/report_builder.py` + `routes/reports.py` |

---

## 语言规范

- **所有回复必须用中文**（简体），用普通人听得懂的语言解释技术内容
- **代码注释**：关键逻辑用中文注释
- **错误信息**：面向用户的错误提示用中文

---

## 环境变量（参考 `.env.example`）

```
GEMINI_API_KEY=        # Google Gemini AI 密钥
STRIPE_SECRET_KEY=     # Stripe 支付密钥
SUPABASE_URL=          # Supabase 项目 URL
SUPABASE_KEY=          # Supabase API 密钥
FINANCIAL_API_KEY=     # 股票数据 API 密钥
```

---

## 项目当前状态（2026-05-30）

- 后端骨架已搭建，主要模块文件已创建
- 前端 `index.html` 已存在
- 尚未完成的功能需参考 `docs/superpowers/plans/` 里的实施计划

---

*本文件由 Claude AI 协助生成，项目负责人：Kevin Loh*
