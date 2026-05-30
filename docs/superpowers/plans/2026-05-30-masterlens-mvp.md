# MasterLens MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack AI investment analysis platform with 10 master framework verdicts, financial data integration, bilingual support, user auth, and Stripe payments.

**Architecture:** React+Vite SPA frontend talks to a Python FastAPI backend. Backend calls Gemini API for AI verdicts, yfinance for financial data, Supabase for persistence/auth, and Stripe for payments. Reports are cached 24h in Supabase PostgreSQL.

**Tech Stack:** React 18, Vite, TailwindCSS, Python 3.11+, FastAPI, Google Gemini API, yfinance, Supabase (PostgreSQL + Auth), Stripe, Vercel (frontend), Railway/Render (backend).

**Spec:** `docs/superpowers/specs/2026-05-30-masterlens-mvp-design.md`

---

## File Structure

### Backend (`backend/`)

| File | Responsibility |
|------|---------------|
| `app/main.py` | FastAPI app, CORS config, router mounting |
| `app/config.py` | Pydantic Settings for env vars |
| `app/models/schemas.py` | Pydantic request/response models |
| `app/models/database.py` | Supabase client singleton |
| `app/routes/analysis.py` | `/api/analyze/{ticker}`, `/api/quote/{ticker}`, `/api/masters/{ticker}` |
| `app/routes/auth.py` | `/api/auth/*` endpoints |
| `app/routes/watchlist.py` | `/api/watchlist/*` CRUD |
| `app/routes/reports.py` | `/api/reports/*` history |
| `app/routes/payments.py` | `/api/checkout/*`, `/api/webhook/stripe` |
| `app/services/financial_data.py` | yfinance wrapper + caching |
| `app/services/gemini_engine.py` | Gemini API client + prompt dispatch |
| `app/services/master_prompts.py` | All 10 master prompt templates |
| `app/services/report_builder.py` | Orchestrates data + AI into full report |
| `app/services/stripe_service.py` | Stripe checkout/webhook logic |
| `requirements.txt` | Python dependencies |
| `.env.example` | Template for environment variables |

### Frontend (`frontend/`)

| File | Responsibility |
|------|---------------|
| `src/main.jsx` | React entry point |
| `src/App.jsx` | Router + layout |
| `src/services/api.js` | Axios client for backend |
| `src/services/supabase.js` | Supabase client for auth |
| `src/pages/Home.jsx` | Landing page (existing HTML converted) |
| `src/pages/Analyze.jsx` | Report view page |
| `src/pages/Dashboard.jsx` | User dashboard |
| `src/pages/Login.jsx` | Auth page |
| `src/pages/Pricing.jsx` | Pricing with Stripe buttons |
| `src/components/Navbar.jsx` | Top nav with lang toggle |
| `src/components/TickerInput.jsx` | Stock ticker search input |
| `src/components/MasterVerdict.jsx` | Single master verdict card |
| `src/components/VerdictGrid.jsx` | Grid of all master verdicts |
| `src/components/ConsensusScore.jsx` | Consensus score display |
| `src/components/WallStreetReport.jsx` | Full report sections |
| `src/components/TradePlan.jsx` | Trade plan display |
| `src/components/WatchlistPanel.jsx` | Watchlist sidebar |
| `src/components/PricingCard.jsx` | Single pricing tier card |

---

## Task 1: Backend Scaffold + Health Check

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/.env.example`
- Create: `backend/app/__init__.py`
- Create: `backend/app/main.py`
- Create: `backend/app/config.py`

- [ ] **Step 1: Create requirements.txt**

```
fastapi==0.115.0
uvicorn[standard]==0.30.0
pydantic==2.9.0
pydantic-settings==2.5.0
google-genai==1.14.0
yfinance==0.2.44
supabase==2.10.0
stripe==11.2.0
httpx==0.27.0
python-dotenv==1.0.1
```

- [ ] **Step 2: Create .env.example**

```
GEMINI_API_KEY=your-gemini-api-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:5173
```

- [ ] **Step 3: Create config.py**

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str
    supabase_url: str
    supabase_service_key: str
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
```

- [ ] **Step 4: Create main.py with health check**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(title="MasterLens API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}
```

- [ ] **Step 5: Create `__init__.py` files**

Create empty `backend/app/__init__.py`, `backend/app/routes/__init__.py`, `backend/app/services/__init__.py`, `backend/app/models/__init__.py`.

- [ ] **Step 6: Install dependencies and test**

Run: `cd backend && pip install -r requirements.txt`
Run: `cd backend && uvicorn app.main:app --reload --port 8000`
Visit: `http://localhost:8000/api/health`
Expected: `{"status": "ok", "version": "0.1.0"}`

- [ ] **Step 7: Commit**

```bash
git add backend/
git commit -m "feat: scaffold FastAPI backend with health check"
```

---

## Task 2: Financial Data Service

**Files:**
- Create: `backend/app/services/financial_data.py`
- Create: `backend/app/models/schemas.py`
- Create: `backend/app/routes/analysis.py` (quote endpoint only)

- [ ] **Step 1: Create Pydantic schemas**

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class StockQuote(BaseModel):
    ticker: str
    company_name: str
    price: float
    currency: str
    exchange: str
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    peg_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    change_percent: Optional[float] = None


class FinancialData(BaseModel):
    quote: StockQuote
    revenue: Optional[float] = None
    net_income: Optional[float] = None
    free_cash_flow: Optional[float] = None
    total_debt: Optional[float] = None
    total_assets: Optional[float] = None
    roe: Optional[float] = None
    debt_to_equity: Optional[float] = None
    revenue_growth: Optional[float] = None
    eps: Optional[float] = None
    sector: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None


class MasterVerdict(BaseModel):
    master_name: str
    master_name_zh: str
    framework: str
    framework_zh: str
    verdict: str  # buy, hold, pass
    score: float
    reasoning_en: str
    reasoning_zh: str
    key_metric: str


class Consensus(BaseModel):
    score: float
    buy_count: int
    hold_count: int
    pass_count: int
    summary_en: str
    summary_zh: str


class WallStreetReport(BaseModel):
    business_model: str
    financial_health: dict
    moat: dict
    dcf_valuation: dict
    bull_case: str
    bear_case: str
    earnings_analysis: str


class TradePlan(BaseModel):
    disclaimer: str = "Educational content only, not investment advice"
    entry_range: dict
    stop_loss: dict
    take_profit: list
    position_size: str
    time_horizon: str


class FullReport(BaseModel):
    ticker: str
    company_name: str
    price: float
    currency: str
    exchange: str
    generated_at: datetime
    language: str
    master_verdicts: list[MasterVerdict]
    consensus: Consensus
    wall_street_report: WallStreetReport
    trade_plan: TradePlan
    data_sources: list[dict]
```

- [ ] **Step 2: Create financial_data.py service**

```python
import yfinance as yf
from app.models.schemas import StockQuote, FinancialData


def get_financial_data(ticker: str) -> FinancialData:
    stock = yf.Ticker(ticker)
    info = stock.info

    quote = StockQuote(
        ticker=ticker.upper(),
        company_name=info.get("longName", info.get("shortName", ticker)),
        price=info.get("currentPrice", info.get("regularMarketPrice", 0)),
        currency=info.get("currency", "USD"),
        exchange=info.get("exchange", ""),
        market_cap=info.get("marketCap"),
        pe_ratio=info.get("trailingPE"),
        pb_ratio=info.get("priceToBook"),
        peg_ratio=info.get("pegRatio"),
        dividend_yield=info.get("dividendYield"),
        fifty_two_week_high=info.get("fiftyTwoWeekHigh"),
        fifty_two_week_low=info.get("fiftyTwoWeekLow"),
        change_percent=info.get("regularMarketChangePercent"),
    )

    financials = stock.financials
    balance = stock.balance_sheet
    cashflow = stock.cashflow

    revenue = None
    net_income = None
    fcf = None
    total_debt = None
    total_assets = None

    if not financials.empty:
        col = financials.columns[0]
        revenue = financials.loc["Total Revenue", col] if "Total Revenue" in financials.index else None
        net_income = financials.loc["Net Income", col] if "Net Income" in financials.index else None

    if not cashflow.empty:
        col = cashflow.columns[0]
        fcf = cashflow.loc["Free Cash Flow", col] if "Free Cash Flow" in cashflow.index else None

    if not balance.empty:
        col = balance.columns[0]
        total_debt = balance.loc["Total Debt", col] if "Total Debt" in balance.index else None
        total_assets = balance.loc["Total Assets", col] if "Total Assets" in balance.index else None

    return FinancialData(
        quote=quote,
        revenue=float(revenue) if revenue is not None else None,
        net_income=float(net_income) if net_income is not None else None,
        free_cash_flow=float(fcf) if fcf is not None else None,
        total_debt=float(total_debt) if total_debt is not None else None,
        total_assets=float(total_assets) if total_assets is not None else None,
        roe=info.get("returnOnEquity"),
        debt_to_equity=info.get("debtToEquity"),
        revenue_growth=info.get("revenueGrowth"),
        eps=info.get("trailingEps"),
        sector=info.get("sector"),
        industry=info.get("industry"),
        description=info.get("longBusinessSummary", ""),
    )
```

- [ ] **Step 3: Create quote endpoint in analysis.py**

```python
from fastapi import APIRouter, HTTPException
from app.services.financial_data import get_financial_data
from app.models.schemas import StockQuote

router = APIRouter(prefix="/api", tags=["analysis"])


@router.get("/quote/{ticker}", response_model=StockQuote)
async def get_quote(ticker: str):
    try:
        data = get_financial_data(ticker)
        return data.quote
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Could not fetch data for {ticker}: {str(e)}")
```

- [ ] **Step 4: Mount router in main.py**

Add to `backend/app/main.py`:

```python
from app.routes.analysis import router as analysis_router

app.include_router(analysis_router)
```

- [ ] **Step 5: Test the quote endpoint**

Run: `cd backend && uvicorn app.main:app --reload --port 8000`
Visit: `http://localhost:8000/api/quote/AAPL`
Expected: JSON with Apple's stock data (price, PE, market cap, etc.)

- [ ] **Step 6: Commit**

```bash
git add backend/
git commit -m "feat: add financial data service and quote endpoint"
```

---

## Task 3: Master Prompts + Gemini Engine

**Files:**
- Create: `backend/app/services/master_prompts.py`
- Create: `backend/app/services/gemini_engine.py`

- [ ] **Step 1: Create master_prompts.py with all 10 master prompts**

```python
MASTER_FRAMEWORKS = [
    {
        "id": "buffett",
        "name": "Warren Buffett",
        "name_zh": "沃伦·巴菲特",
        "framework": "Owner Earnings Model",
        "framework_zh": "所有者收益模型",
        "prompt": """You are Warren Buffett analyzing {ticker} ({company_name}).

Use the Owner Earnings Model: Net Income + Depreciation - CapEx = Owner Earnings.
Focus on: durable competitive advantage (moat), predictable earnings, honest management, return on equity > 15%, low debt, consistent free cash flow.

Financial data:
{financial_summary}

Respond in this exact JSON format:
{{
  "verdict": "buy" or "hold" or "pass",
  "score": <float 1-10>,
  "reasoning_en": "<2-3 sentences in Buffett's voice, first person>",
  "reasoning_zh": "<same reasoning in Chinese, Buffett's voice>",
  "key_metric": "<the single most important metric and its value>"
}}

Speak as Buffett would — folksy, Omaha wisdom, focus on long-term value.""",
    },
    {
        "id": "graham",
        "name": "Benjamin Graham",
        "name_zh": "本杰明·格雷厄姆",
        "framework": "Margin of Safety & Graham Number",
        "framework_zh": "安全边际与格雷厄姆数值",
        "prompt": """You are Benjamin Graham analyzing {ticker} ({company_name}).

Use the Graham Number: sqrt(22.5 * EPS * Book Value Per Share).
Focus on: margin of safety (stock price vs intrinsic value), P/E < 15, P/B < 1.5, current ratio > 2, consistent dividends, earnings stability over 10 years.

Financial data:
{financial_summary}

Respond in this exact JSON format:
{{
  "verdict": "buy" or "hold" or "pass",
  "score": <float 1-10>,
  "reasoning_en": "<2-3 sentences in Graham's academic, cautious voice>",
  "reasoning_zh": "<same reasoning in Chinese>",
  "key_metric": "<Graham Number vs current price, or P/E ratio>"
}}

Speak as Graham would — scholarly, conservative, focused on downside protection.""",
    },
    {
        "id": "lynch",
        "name": "Peter Lynch",
        "name_zh": "彼得·林奇",
        "framework": "PEG / GARP",
        "framework_zh": "PEG / GARP 成长合理价",
        "prompt": """You are Peter Lynch analyzing {ticker} ({company_name}).

Use the GARP approach: PEG ratio (P/E divided by earnings growth rate). PEG < 1 = undervalued, PEG 1-2 = fair, PEG > 2 = overvalued.
Classify the stock: slow grower, stalwart, fast grower, cyclical, turnaround, or asset play.
Focus on: earnings growth rate, PEG ratio, what the company actually does (keep it simple), whether you'd explain it to a 5th grader.

Financial data:
{financial_summary}

Respond in this exact JSON format:
{{
  "verdict": "buy" or "hold" or "pass",
  "score": <float 1-10>,
  "reasoning_en": "<2-3 sentences in Lynch's conversational, everyday-investor voice>",
  "reasoning_zh": "<same reasoning in Chinese>",
  "key_metric": "<PEG ratio and stock classification>"
}}

Speak as Lynch would — casual, relatable, uses everyday analogies.""",
    },
    {
        "id": "munger",
        "name": "Charlie Munger",
        "name_zh": "查理·芒格",
        "framework": "Mental Models Checklist",
        "framework_zh": "心智模式清单",
        "prompt": """You are Charlie Munger analyzing {ticker} ({company_name}).

Apply your mental models checklist: inversion (what could go wrong?), circle of competence, opportunity cost, moat durability, management quality, simple business model.
Focus on: can this business be disrupted in 10 years? Is management honest and capable? Would you hold this for 20 years?

Financial data:
{financial_summary}

Respond in this exact JSON format:
{{
  "verdict": "buy" or "hold" or "pass",
  "score": <float 1-10>,
  "reasoning_en": "<2-3 sentences in Munger's blunt, witty voice>",
  "reasoning_zh": "<same reasoning in Chinese>",
  "key_metric": "<the mental model that matters most here>"
}}

Speak as Munger would — direct, sometimes sardonic, emphasizes avoiding stupidity over being brilliant.""",
    },
    {
        "id": "fisher",
        "name": "Philip Fisher",
        "name_zh": "菲利普·费雪",
        "framework": "Scuttlebutt 15 Points",
        "framework_zh": "精挑细选十五要点",
        "prompt": """You are Philip Fisher analyzing {ticker} ({company_name}).

Apply your 15-point checklist focusing on: R&D spending growth, sales organization quality, profit margin trends, management depth, long-range outlook, insider ownership.
Focus on: is this company a genuine innovator? Does management have integrity? Is R&D producing results?

Financial data:
{financial_summary}

Respond in this exact JSON format:
{{
  "verdict": "buy" or "hold" or "pass",
  "score": <float 1-10>,
  "reasoning_en": "<2-3 sentences in Fisher's growth-focused, research-driven voice>",
  "reasoning_zh": "<same reasoning in Chinese>",
  "key_metric": "<R&D to revenue ratio or profit margin trend>"
}}

Speak as Fisher would — thoughtful, research-oriented, focused on qualitative growth factors.""",
    },
    {
        "id": "greenblatt",
        "name": "Joel Greenblatt",
        "name_zh": "乔尔·格林布拉特",
        "framework": "Magic Formula",
        "framework_zh": "神奇公式",
        "prompt": """You are Joel Greenblatt analyzing {ticker} ({company_name}).

Apply the Magic Formula: rank stocks by (1) Earnings Yield = EBIT / Enterprise Value, and (2) Return on Capital = EBIT / (Net Working Capital + Net Fixed Assets).
Focus on: is this a good business (high ROC) at a cheap price (high earnings yield)? Compare to market averages.

Financial data:
{financial_summary}

Respond in this exact JSON format:
{{
  "verdict": "buy" or "hold" or "pass",
  "score": <float 1-10>,
  "reasoning_en": "<2-3 sentences in Greenblatt's systematic, quantitative voice>",
  "reasoning_zh": "<same reasoning in Chinese>",
  "key_metric": "<Earnings Yield and Return on Capital values>"
}}

Speak as Greenblatt would — systematic, numbers-driven, clear and logical.""",
    },
    {
        "id": "dalio",
        "name": "Ray Dalio",
        "name_zh": "瑞·达利欧",
        "framework": "Debt Cycle & All-Weather",
        "framework_zh": "债务周期与全天候策略",
        "prompt": """You are Ray Dalio analyzing {ticker} ({company_name}).

Apply your macro framework: where are we in the debt cycle? How does this company perform across different economic environments (growth up/down, inflation up/down)?
Focus on: balance sheet strength, debt levels, cyclicality, correlation with macro factors, diversification value.

Financial data:
{financial_summary}

Respond in this exact JSON format:
{{
  "verdict": "buy" or "hold" or "pass",
  "score": <float 1-10>,
  "reasoning_en": "<2-3 sentences in Dalio's principles-based, macro voice>",
  "reasoning_zh": "<same reasoning in Chinese>",
  "key_metric": "<debt-to-equity or cyclicality assessment>"
}}

Speak as Dalio would — principled, systematic, macro-aware, focuses on risk parity.""",
    },
    {
        "id": "wood",
        "name": "Cathie Wood",
        "name_zh": "凯西·伍德",
        "framework": "Disruptive Innovation",
        "framework_zh": "颠覆性创新",
        "prompt": """You are Cathie Wood analyzing {ticker} ({company_name}).

Apply your disruptive innovation framework: is this company riding one of the 5 innovation platforms (AI, robotics, energy storage, blockchain, multi-omic sequencing)?
Focus on: total addressable market growth, Wright's Law cost curves, S-curve adoption, 5-year revenue potential, innovation pipeline.

Financial data:
{financial_summary}

Respond in this exact JSON format:
{{
  "verdict": "buy" or "hold" or "pass",
  "score": <float 1-10>,
  "reasoning_en": "<2-3 sentences in Wood's innovation-bullish, forward-looking voice>",
  "reasoning_zh": "<same reasoning in Chinese>",
  "key_metric": "<TAM growth rate or innovation platform alignment>"
}}

Speak as Wood would — enthusiastic about innovation, focused on 5-year horizon, conviction-driven.""",
    },
    {
        "id": "bogle",
        "name": "John Bogle",
        "name_zh": "约翰·博格尔",
        "framework": "Index Investing Principles",
        "framework_zh": "指数化投资原则",
        "prompt": """You are John Bogle analyzing {ticker} ({company_name}).

Apply your indexing philosophy: most active stock-picking underperforms the index. Evaluate this stock vs simply buying the S&P 500.
Focus on: cost of ownership, dividend yield vs index average, risk-adjusted returns, whether individual stock picking is justified here.

Financial data:
{financial_summary}

Respond in this exact JSON format:
{{
  "verdict": "buy" or "hold" or "pass",
  "score": <float 1-10>,
  "reasoning_en": "<2-3 sentences in Bogle's skeptical-of-stock-picking, cost-conscious voice>",
  "reasoning_zh": "<same reasoning in Chinese>",
  "key_metric": "<dividend yield vs S&P 500 average, or risk assessment>"
}}

Speak as Bogle would — humble, cost-focused, skeptical of active management, pro-diversification.""",
    },
    {
        "id": "klarman",
        "name": "Seth Klarman",
        "name_zh": "塞斯·卡拉曼",
        "framework": "Deep Value & Risk Management",
        "framework_zh": "深度价值与风险管理",
        "prompt": """You are Seth Klarman analyzing {ticker} ({company_name}).

Apply your deep value approach: focus on absolute returns, not relative. Look for catalysts that will unlock value. Emphasize downside protection above all.
Focus on: price vs liquidation value, margin of safety, identifiable catalysts, risk of permanent capital loss, institutional ownership.

Financial data:
{financial_summary}

Respond in this exact JSON format:
{{
  "verdict": "buy" or "hold" or "pass",
  "score": <float 1-10>,
  "reasoning_en": "<2-3 sentences in Klarman's cautious, value-obsessed voice>",
  "reasoning_zh": "<same reasoning in Chinese>",
  "key_metric": "<margin of safety percentage or catalyst identified>"
}}

Speak as Klarman would — patient, risk-averse, obsessed with margin of safety, willing to hold cash.""",
    },
]

WALL_STREET_REPORT_PROMPT = """You are a senior Wall Street equity research analyst writing a comprehensive report on {ticker} ({company_name}).

Financial data:
{financial_summary}

Master verdicts summary:
{verdicts_summary}

Generate a complete equity research report in {language}. Respond in this exact JSON format:
{{
  "business_model": "<1 paragraph describing the business model and competitive position>",
  "financial_health": {{
    "score": <int 1-10>,
    "details": "<1 paragraph on revenue, margins, cash flow, debt>"
  }},
  "moat": {{
    "score": <int 1-10>,
    "type": "<moat type: Brand, Network Effect, Switching Cost, Cost Advantage, etc.>",
    "details": "<1 paragraph on competitive advantages>"
  }},
  "dcf_valuation": {{
    "fair_value": <estimated fair value per share as float>,
    "upside": "<percentage upside/downside from current price>",
    "assumptions": "<key DCF assumptions: growth rate, discount rate, terminal multiple>"
  }},
  "bull_case": "<1 paragraph bull case>",
  "bear_case": "<1 paragraph bear case>",
  "earnings_analysis": "<1 paragraph on recent earnings and forward outlook>"
}}

Use {language_instruction}. Be specific with numbers. Cite the financial data provided."""

TRADE_PLAN_PROMPT = """You are an experienced trading coach creating an educational trade simulation for {ticker} ({company_name}).

Current price: ${price}
52-week high: ${high_52}
52-week low: ${low_52}
Master consensus score: {consensus_score}/10

Financial data:
{financial_summary}

Generate an educational trading scenario in {language}. Respond in this exact JSON format:
{{
  "entry_range": {{ "low": <float>, "high": <float> }},
  "stop_loss": {{ "price": <float>, "logic": "<1 sentence explaining the stop-loss level>" }},
  "take_profit": [
    {{ "price": <float>, "ratio": "50%" }},
    {{ "price": <float>, "ratio": "50%" }}
  ],
  "position_size": "<suggestion like 'Max 3-5% of portfolio'>",
  "time_horizon": "<e.g. '6-12 months'>"
}}

IMPORTANT: This is for EDUCATIONAL purposes only. Always frame as a simulation, never as advice.
Use {language_instruction}."""


def build_financial_summary(data) -> str:
    lines = [
        f"Company: {data.quote.company_name} ({data.quote.ticker})",
        f"Current Price: {data.quote.currency} {data.quote.price}",
        f"Market Cap: {data.quote.market_cap:,.0f}" if data.quote.market_cap else "",
        f"P/E Ratio: {data.quote.pe_ratio:.2f}" if data.quote.pe_ratio else "P/E: N/A",
        f"P/B Ratio: {data.quote.pb_ratio:.2f}" if data.quote.pb_ratio else "P/B: N/A",
        f"PEG Ratio: {data.quote.peg_ratio:.2f}" if data.quote.peg_ratio else "PEG: N/A",
        f"Dividend Yield: {data.quote.dividend_yield:.2%}" if data.quote.dividend_yield else "Dividend: None",
        f"52-Week High: {data.quote.fifty_two_week_high}" if data.quote.fifty_two_week_high else "",
        f"52-Week Low: {data.quote.fifty_two_week_low}" if data.quote.fifty_two_week_low else "",
        f"Revenue: {data.revenue:,.0f}" if data.revenue else "",
        f"Net Income: {data.net_income:,.0f}" if data.net_income else "",
        f"Free Cash Flow: {data.free_cash_flow:,.0f}" if data.free_cash_flow else "",
        f"ROE: {data.roe:.2%}" if data.roe else "",
        f"Debt/Equity: {data.debt_to_equity:.2f}" if data.debt_to_equity else "",
        f"Revenue Growth: {data.revenue_growth:.2%}" if data.revenue_growth else "",
        f"EPS: {data.eps}" if data.eps else "",
        f"Sector: {data.sector}" if data.sector else "",
        f"Industry: {data.industry}" if data.industry else "",
    ]
    return "\n".join(line for line in lines if line)
```

- [ ] **Step 2: Create gemini_engine.py**

```python
import json
import re
from google import genai
from app.config import settings


client = genai.Client(api_key=settings.gemini_api_key)
MODEL = "gemini-2.0-flash"


async def generate_master_verdict(prompt: str) -> dict:
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "temperature": 0.7,
        },
    )
    text = response.text.strip()
    return json.loads(text)


async def generate_report_section(prompt: str) -> dict:
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "temperature": 0.5,
        },
    )
    text = response.text.strip()
    return json.loads(text)
```

- [ ] **Step 3: Commit**

```bash
git add backend/
git commit -m "feat: add master prompts and Gemini engine"
```

---

## Task 4: Report Builder + Analyze Endpoint

**Files:**
- Create: `backend/app/services/report_builder.py`
- Modify: `backend/app/routes/analysis.py`

- [ ] **Step 1: Create report_builder.py**

```python
from datetime import datetime, timezone
from app.services.financial_data import get_financial_data
from app.services.gemini_engine import generate_master_verdict, generate_report_section
from app.services.master_prompts import (
    MASTER_FRAMEWORKS,
    WALL_STREET_REPORT_PROMPT,
    TRADE_PLAN_PROMPT,
    build_financial_summary,
)
from app.models.schemas import (
    FullReport, MasterVerdict, Consensus, WallStreetReport, TradePlan,
)


async def build_full_report(ticker: str, lang: str = "zh") -> dict:
    data = get_financial_data(ticker)
    financial_summary = build_financial_summary(data)

    language = "Chinese (简体中文)" if lang == "zh" else "English"
    language_instruction = "Write all text in Chinese (简体中文)." if lang == "zh" else "Write all text in English."

    verdicts = []
    for master in MASTER_FRAMEWORKS:
        prompt = master["prompt"].format(
            ticker=ticker,
            company_name=data.quote.company_name,
            financial_summary=financial_summary,
        )
        result = await generate_master_verdict(prompt)
        verdicts.append(MasterVerdict(
            master_name=master["name"],
            master_name_zh=master["name_zh"],
            framework=master["framework"],
            framework_zh=master["framework_zh"],
            verdict=result.get("verdict", "hold"),
            score=float(result.get("score", 5)),
            reasoning_en=result.get("reasoning_en", ""),
            reasoning_zh=result.get("reasoning_zh", ""),
            key_metric=result.get("key_metric", ""),
        ))

    buy_count = sum(1 for v in verdicts if v.verdict == "buy")
    hold_count = sum(1 for v in verdicts if v.verdict == "hold")
    pass_count = sum(1 for v in verdicts if v.verdict == "pass")
    avg_score = sum(v.score for v in verdicts) / len(verdicts) if verdicts else 5.0

    verdicts_summary = "\n".join(
        f"- {v.master_name}: {v.verdict.upper()} ({v.score}/10) - {v.key_metric}"
        for v in verdicts
    )

    ws_prompt = WALL_STREET_REPORT_PROMPT.format(
        ticker=ticker,
        company_name=data.quote.company_name,
        financial_summary=financial_summary,
        verdicts_summary=verdicts_summary,
        language=language,
        language_instruction=language_instruction,
    )
    ws_result = await generate_report_section(ws_prompt)

    tp_prompt = TRADE_PLAN_PROMPT.format(
        ticker=ticker,
        company_name=data.quote.company_name,
        price=data.quote.price,
        high_52=data.quote.fifty_two_week_high or data.quote.price * 1.2,
        low_52=data.quote.fifty_two_week_low or data.quote.price * 0.8,
        consensus_score=round(avg_score, 1),
        financial_summary=financial_summary,
        language=language,
        language_instruction=language_instruction,
    )
    tp_result = await generate_report_section(tp_prompt)

    report = FullReport(
        ticker=ticker.upper(),
        company_name=data.quote.company_name,
        price=data.quote.price,
        currency=data.quote.currency,
        exchange=data.quote.exchange,
        generated_at=datetime.now(timezone.utc),
        language=lang,
        master_verdicts=verdicts,
        consensus=Consensus(
            score=round(avg_score, 1),
            buy_count=buy_count,
            hold_count=hold_count,
            pass_count=pass_count,
            summary_en=f"{buy_count} masters say Buy, {hold_count} say Hold, {pass_count} say Pass.",
            summary_zh=f"{buy_count} 位大师建议买入，{hold_count} 位建议观察，{pass_count} 位建议放弃。",
        ),
        wall_street_report=WallStreetReport(**ws_result),
        trade_plan=TradePlan(**tp_result),
        data_sources=[
            {"label": f"yfinance real-time data", "field": "price, financials"},
            {"label": f"{data.quote.company_name} public filings", "field": "fundamentals"},
        ],
    )
    return report.model_dump()
```

- [ ] **Step 2: Add analyze endpoint to analysis.py**

Append to `backend/app/routes/analysis.py`:

```python
from app.services.report_builder import build_full_report


@router.get("/analyze/{ticker}")
async def analyze_stock(ticker: str, lang: str = "zh"):
    try:
        report = await build_full_report(ticker, lang)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
```

- [ ] **Step 3: Test the analyze endpoint**

Run: `cd backend && uvicorn app.main:app --reload --port 8000`
Visit: `http://localhost:8000/api/analyze/AAPL?lang=zh`
Expected: Full JSON report with 10 master verdicts, Wall Street report, and trade plan. Takes 30-60 seconds due to multiple Gemini calls.

- [ ] **Step 4: Commit**

```bash
git add backend/
git commit -m "feat: add report builder and analyze endpoint with 10 master verdicts"
```

---

## Task 5: Supabase Database Setup

**Files:**
- Create: `backend/app/models/database.py`
- Modify: `backend/app/routes/analysis.py` (add caching)

- [ ] **Step 1: Create database tables in Supabase**

Run these SQL migrations via Supabase MCP or dashboard:

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'single', 'pro', 'lifetime')),
  reports_used_this_month INT DEFAULT 0,
  reports_reset_at TIMESTAMPTZ DEFAULT NOW(),
  stripe_customer_id TEXT,
  language_pref TEXT DEFAULT 'zh',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ticker VARCHAR(20) NOT NULL,
  language TEXT DEFAULT 'zh',
  report_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
CREATE INDEX idx_reports_ticker ON public.reports(ticker, created_at DESC);

CREATE TABLE public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ticker VARCHAR(20) NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ticker)
);

CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  stripe_session_id TEXT,
  product_type TEXT CHECK (product_type IN ('single_report', 'pro_monthly', 'pro_annual', 'lifetime')),
  amount_cents INT,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can read own reports" ON public.reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own watchlist" ON public.watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own watchlist" ON public.watchlist FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can read own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
```

- [ ] **Step 2: Create database.py Supabase client**

```python
from supabase import create_client
from app.config import settings

supabase = create_client(settings.supabase_url, settings.supabase_service_key)
```

- [ ] **Step 3: Add report caching to analysis.py**

Replace the analyze endpoint in `backend/app/routes/analysis.py`:

```python
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException
from app.services.financial_data import get_financial_data
from app.services.report_builder import build_full_report
from app.models.schemas import StockQuote
from app.models.database import supabase

router = APIRouter(prefix="/api", tags=["analysis"])


@router.get("/quote/{ticker}", response_model=StockQuote)
async def get_quote(ticker: str):
    try:
        data = get_financial_data(ticker)
        return data.quote
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Could not fetch data for {ticker}: {str(e)}")


@router.get("/analyze/{ticker}")
async def analyze_stock(ticker: str, lang: str = "zh"):
    ticker_upper = ticker.upper()
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()

    cached = supabase.table("reports").select("report_data").eq(
        "ticker", ticker_upper
    ).eq("language", lang).gte("created_at", cutoff).order(
        "created_at", desc=True
    ).limit(1).execute()

    if cached.data:
        return cached.data[0]["report_data"]

    try:
        report = await build_full_report(ticker_upper, lang)
        supabase.table("reports").insert({
            "ticker": ticker_upper,
            "language": lang,
            "report_data": report,
        }).execute()
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
```

- [ ] **Step 4: Commit**

```bash
git add backend/
git commit -m "feat: add Supabase database setup and report caching"
```

---

## Task 6: Auth Routes

**Files:**
- Create: `backend/app/routes/auth.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: Create auth.py**

```python
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from app.models.database import supabase

router = APIRouter(prefix="/api/auth", tags=["auth"])


class AuthRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    user_id: str
    email: str


@router.post("/register", response_model=AuthResponse)
async def register(req: AuthRequest):
    try:
        result = supabase.auth.sign_up({"email": req.email, "password": req.password})
        if result.user is None:
            raise HTTPException(status_code=400, detail="Registration failed")
        return AuthResponse(
            access_token=result.session.access_token,
            user_id=str(result.user.id),
            email=result.user.email,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=AuthResponse)
async def login(req: AuthRequest):
    try:
        result = supabase.auth.sign_in_with_password({"email": req.email, "password": req.password})
        if result.user is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return AuthResponse(
            access_token=result.session.access_token,
            user_id=str(result.user.id),
            email=result.user.email,
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me")
async def get_me(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1]
    try:
        user = supabase.auth.get_user(token)
        profile = supabase.table("profiles").select("*").eq("id", str(user.user.id)).single().execute()
        return {
            "id": str(user.user.id),
            "email": user.user.email,
            **profile.data,
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
```

- [ ] **Step 2: Mount auth router in main.py**

Add to `backend/app/main.py`:

```python
from app.routes.auth import router as auth_router

app.include_router(auth_router)
```

- [ ] **Step 3: Commit**

```bash
git add backend/
git commit -m "feat: add auth routes (register, login, me)"
```

---

## Task 7: Watchlist + Reports Routes

**Files:**
- Create: `backend/app/routes/watchlist.py`
- Create: `backend/app/routes/reports.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: Create watchlist.py**

```python
from fastapi import APIRouter, HTTPException, Header
from app.models.database import supabase

router = APIRouter(prefix="/api/watchlist", tags=["watchlist"])


def get_user_id(authorization: str) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1]
    user = supabase.auth.get_user(token)
    return str(user.user.id)


@router.get("")
async def list_watchlist(authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    result = supabase.table("watchlist").select("*").eq("user_id", user_id).order("added_at", desc=True).execute()
    return result.data


@router.post("/{ticker}")
async def add_to_watchlist(ticker: str, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    existing = supabase.table("watchlist").select("id").eq("user_id", user_id).execute()
    if len(existing.data) >= 10:
        profile = supabase.table("profiles").select("plan").eq("id", user_id).single().execute()
        if profile.data["plan"] == "free":
            raise HTTPException(status_code=403, detail="Free plan limited to 10 watchlist items. Upgrade to Pro.")

    try:
        supabase.table("watchlist").insert({"user_id": user_id, "ticker": ticker.upper()}).execute()
        return {"status": "added", "ticker": ticker.upper()}
    except Exception:
        raise HTTPException(status_code=409, detail="Already in watchlist")


@router.delete("/{ticker}")
async def remove_from_watchlist(ticker: str, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    supabase.table("watchlist").delete().eq("user_id", user_id).eq("ticker", ticker.upper()).execute()
    return {"status": "removed", "ticker": ticker.upper()}
```

- [ ] **Step 2: Create reports.py**

```python
from fastapi import APIRouter, HTTPException, Header
from app.models.database import supabase

router = APIRouter(prefix="/api/reports", tags=["reports"])


def get_user_id(authorization: str) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1]
    user = supabase.auth.get_user(token)
    return str(user.user.id)


@router.get("")
async def list_reports(authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    result = supabase.table("reports").select(
        "id, ticker, language, created_at"
    ).eq("user_id", user_id).order("created_at", desc=True).limit(50).execute()
    return result.data


@router.get("/{report_id}")
async def get_report(report_id: str, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    result = supabase.table("reports").select("*").eq("id", report_id).eq("user_id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found")
    return result.data
```

- [ ] **Step 3: Mount routers in main.py**

Add to `backend/app/main.py`:

```python
from app.routes.watchlist import router as watchlist_router
from app.routes.reports import router as reports_router

app.include_router(watchlist_router)
app.include_router(reports_router)
```

- [ ] **Step 4: Commit**

```bash
git add backend/
git commit -m "feat: add watchlist and reports routes"
```

---

## Task 8: Stripe Payments

**Files:**
- Create: `backend/app/services/stripe_service.py`
- Create: `backend/app/routes/payments.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: Create stripe_service.py**

```python
import stripe
from app.config import settings

stripe.api_key = settings.stripe_secret_key

PRODUCTS = {
    "single_report": {"name": "MasterLens Single Report", "amount": 900, "mode": "payment"},
    "pro_monthly": {"name": "MasterLens Pro Monthly", "amount": 1900, "mode": "subscription"},
    "pro_annual": {"name": "MasterLens Pro Annual", "amount": 17900, "mode": "subscription"},
    "lifetime": {"name": "MasterLens Founding Member", "amount": 29900, "mode": "payment"},
}


def create_checkout_session(product_type: str, user_email: str, success_url: str, cancel_url: str) -> str:
    product = PRODUCTS[product_type]

    params = {
        "customer_email": user_email,
        "success_url": success_url,
        "cancel_url": cancel_url,
        "metadata": {"product_type": product_type},
    }

    if product["mode"] == "subscription":
        params["mode"] = "subscription"
        params["line_items"] = [{
            "price_data": {
                "currency": "usd",
                "product_data": {"name": product["name"]},
                "unit_amount": product["amount"],
                "recurring": {
                    "interval": "month" if "monthly" in product_type else "year",
                },
            },
            "quantity": 1,
        }]
    else:
        params["mode"] = "payment"
        params["line_items"] = [{
            "price_data": {
                "currency": "usd",
                "product_data": {"name": product["name"]},
                "unit_amount": product["amount"],
            },
            "quantity": 1,
        }]

    session = stripe.checkout.Session.create(**params)
    return session.url
```

- [ ] **Step 2: Create payments.py routes**

```python
from fastapi import APIRouter, HTTPException, Header, Request
from pydantic import BaseModel
import stripe
from app.config import settings
from app.services.stripe_service import create_checkout_session
from app.models.database import supabase

router = APIRouter(prefix="/api", tags=["payments"])


class CheckoutRequest(BaseModel):
    product_type: str  # single_report, pro_monthly, pro_annual, lifetime


@router.post("/checkout")
async def create_checkout(req: CheckoutRequest, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Login required")
    token = authorization.split(" ")[1]
    user = supabase.auth.get_user(token)

    if req.product_type not in ("single_report", "pro_monthly", "pro_annual", "lifetime"):
        raise HTTPException(status_code=400, detail="Invalid product type")

    url = create_checkout_session(
        product_type=req.product_type,
        user_email=user.user.email,
        success_url=f"{settings.frontend_url}/dashboard?payment=success",
        cancel_url=f"{settings.frontend_url}/pricing?payment=cancelled",
    )
    return {"checkout_url": url}


@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig, settings.stripe_webhook_secret)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        product_type = session.get("metadata", {}).get("product_type", "")
        customer_email = session.get("customer_email", "")

        if customer_email and product_type:
            user_result = supabase.from_("profiles").select("id").eq(
                "id",
                supabase.from_("auth.users").select("id").eq("email", customer_email).single().execute().data["id"]
            ).single().execute()

            plan_map = {
                "single_report": "single",
                "pro_monthly": "pro",
                "pro_annual": "pro",
                "lifetime": "lifetime",
            }
            new_plan = plan_map.get(product_type, "free")

            if user_result.data:
                supabase.table("profiles").update({"plan": new_plan}).eq("id", user_result.data["id"]).execute()
                supabase.table("purchases").insert({
                    "user_id": user_result.data["id"],
                    "stripe_session_id": session["id"],
                    "product_type": product_type,
                    "amount_cents": session.get("amount_total", 0),
                    "status": "completed",
                }).execute()

    return {"status": "ok"}
```

- [ ] **Step 3: Mount payments router in main.py**

Add to `backend/app/main.py`:

```python
from app.routes.payments import router as payments_router

app.include_router(payments_router)
```

- [ ] **Step 4: Commit**

```bash
git add backend/
git commit -m "feat: add Stripe checkout and webhook routes"
```

---

## Task 9: Frontend Scaffold

**Files:**
- Create: `frontend/` directory with Vite + React + Tailwind

- [ ] **Step 1: Initialize Vite React project**

```bash
cd masterlens
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom axios @supabase/supabase-js
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: Configure Tailwind**

Update `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
```

Replace `frontend/src/index.css`:

```css
@import "tailwindcss";

:root {
  --navy: #0a1628;
  --navy-light: #132038;
  --gold: #c9a84c;
  --gold-light: #e8d48b;
  --gold-dim: #a08432;
}

body {
  background-color: var(--navy);
  color: #c8c2b8;
  font-family: 'Inter', 'Noto Sans SC', sans-serif;
}
```

- [ ] **Step 3: Create API service**

Create `frontend/src/services/api.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getQuote = (ticker) => api.get(`/api/quote/${ticker}`);
export const analyzeStock = (ticker, lang = 'zh') => api.get(`/api/analyze/${ticker}?lang=${lang}`);
export const getWatchlist = () => api.get('/api/watchlist');
export const addToWatchlist = (ticker) => api.post(`/api/watchlist/${ticker}`);
export const removeFromWatchlist = (ticker) => api.delete(`/api/watchlist/${ticker}`);
export const getReports = () => api.get('/api/reports');
export const createCheckout = (productType) => api.post('/api/checkout', { product_type: productType });

export default api;
```

- [ ] **Step 4: Create Supabase client**

Create `frontend/src/services/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 5: Create App.jsx with router**

Replace `frontend/src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analyze/:ticker" element={<Analyze />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 6: Create placeholder pages**

Create `frontend/src/pages/Home.jsx`:
```jsx
export default function Home() {
  return <div className="pt-20 text-center text-2xl text-[var(--gold)]">MasterLens 大师镜</div>;
}
```

Create `frontend/src/pages/Analyze.jsx`:
```jsx
export default function Analyze() {
  return <div className="pt-20 text-center">Analysis page</div>;
}
```

Create `frontend/src/pages/Login.jsx`:
```jsx
export default function Login() {
  return <div className="pt-20 text-center">Login page</div>;
}
```

Create `frontend/src/pages/Dashboard.jsx`:
```jsx
export default function Dashboard() {
  return <div className="pt-20 text-center">Dashboard</div>;
}
```

Create `frontend/src/pages/Pricing.jsx`:
```jsx
export default function Pricing() {
  return <div className="pt-20 text-center">Pricing</div>;
}
```

- [ ] **Step 7: Create Navbar component**

Create `frontend/src/components/Navbar.jsx`:

```jsx
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const [lang, setLang] = useState('zh');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--navy)]/90 backdrop-blur-xl border-b border-[var(--gold)]/15">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl font-bold text-[var(--gold)] flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dim)] rounded-lg flex items-center justify-center text-[var(--navy)] text-sm font-black">M</span>
          MasterLens
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/pricing" className="text-sm text-gray-400 hover:text-[var(--gold)]">
            {lang === 'zh' ? '定价' : 'Pricing'}
          </Link>
          <Link to="/dashboard" className="text-sm text-gray-400 hover:text-[var(--gold)]">
            {lang === 'zh' ? '面板' : 'Dashboard'}
          </Link>
          <div className="flex bg-white/5 border border-[var(--gold)]/15 rounded-full p-0.5">
            <button onClick={() => setLang('zh')} className={`px-3 py-1 rounded-full text-xs font-semibold transition ${lang === 'zh' ? 'bg-[var(--gold)] text-[var(--navy)]' : 'text-gray-400'}`}>中</button>
            <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-full text-xs font-semibold transition ${lang === 'en' ? 'bg-[var(--gold)] text-[var(--navy)]' : 'text-gray-400'}`}>EN</button>
          </div>
          <Link to="/login" className="bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dim)] text-[var(--navy)] px-4 py-2 rounded-lg text-sm font-bold">
            {lang === 'zh' ? '登录' : 'Login'}
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 8: Update main.jsx**

Replace `frontend/src/main.jsx`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 9: Test frontend**

Run: `cd frontend && npm run dev`
Visit: `http://localhost:5173`
Expected: MasterLens navbar with nav links and placeholder pages.

- [ ] **Step 10: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold React frontend with router, Tailwind, API client"
```

---

## Task 10: Analyze Page (Core UI)

**Files:**
- Create: `frontend/src/components/TickerInput.jsx`
- Create: `frontend/src/components/MasterVerdict.jsx`
- Create: `frontend/src/components/VerdictGrid.jsx`
- Create: `frontend/src/components/ConsensusScore.jsx`
- Create: `frontend/src/components/WallStreetReport.jsx`
- Create: `frontend/src/components/TradePlan.jsx`
- Modify: `frontend/src/pages/Analyze.jsx`
- Modify: `frontend/src/pages/Home.jsx`

- [ ] **Step 1: Create TickerInput.jsx**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TickerInput({ size = 'lg' }) {
  const [ticker, setTicker] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticker.trim()) navigate(`/analyze/${ticker.trim().toUpperCase()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={ticker}
        onChange={(e) => setTicker(e.target.value.toUpperCase())}
        placeholder="AAPL, 0700.HK, TSLA..."
        maxLength={10}
        className={`flex-1 bg-[var(--navy)] border border-[var(--gold)]/25 rounded-xl text-white font-mono tracking-wider uppercase outline-none focus:border-[var(--gold)] transition ${size === 'lg' ? 'px-5 py-4 text-lg' : 'px-4 py-3 text-base'}`}
      />
      <button type="submit" className={`bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dim)] text-[var(--navy)] rounded-xl font-bold whitespace-nowrap hover:shadow-lg hover:shadow-[var(--gold)]/20 transition ${size === 'lg' ? 'px-8 py-4 text-lg' : 'px-6 py-3'}`}>
        获取裁决
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Create MasterVerdict.jsx**

```jsx
const avatarColors = {
  buy: 'bg-emerald-500/15 text-emerald-400',
  hold: 'bg-yellow-500/15 text-yellow-400',
  pass: 'bg-red-500/15 text-red-400',
};

const tagStyles = {
  buy: 'bg-emerald-500/15 text-emerald-400',
  hold: 'bg-yellow-500/15 text-yellow-400',
  pass: 'bg-red-500/15 text-red-400',
};

const tagLabels = { buy: '买入', hold: '观察', pass: '放弃' };

export default function MasterVerdict({ verdict, lang = 'zh' }) {
  const initials = verdict.master_name.split(' ').map(w => w[0]).join('');

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:border-[var(--gold)]/20 transition">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${avatarColors[verdict.verdict]}`}>
          {initials}
        </div>
        <div>
          <h4 className="text-white text-sm font-semibold">{lang === 'zh' ? verdict.master_name_zh : verdict.master_name}</h4>
          <span className="text-xs text-gray-500">{lang === 'zh' ? verdict.framework_zh : verdict.framework}</span>
        </div>
      </div>
      <p className="text-sm text-gray-400 italic border-l-2 border-white/10 pl-3 mb-3 leading-relaxed">
        {lang === 'zh' ? verdict.reasoning_zh : verdict.reasoning_en}
      </p>
      <div className="flex justify-between items-center">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${tagStyles[verdict.verdict]}`}>
          {lang === 'zh' ? tagLabels[verdict.verdict] : verdict.verdict.toUpperCase()}
        </span>
        <span className="text-xs text-gray-500">{verdict.score}/10</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create VerdictGrid.jsx**

```jsx
import MasterVerdict from './MasterVerdict';

export default function VerdictGrid({ verdicts, lang = 'zh' }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {verdicts.map((v, i) => (
        <MasterVerdict key={i} verdict={v} lang={lang} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create ConsensusScore.jsx**

```jsx
export default function ConsensusScore({ consensus, lang = 'zh' }) {
  return (
    <div className="bg-gradient-to-r from-[var(--gold)]/10 to-[var(--gold)]/5 border border-[var(--gold)]/20 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6">
      <div>
        <div className="text-4xl font-serif font-black bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] bg-clip-text text-transparent">
          {consensus.score} <span className="text-xl">/10</span>
        </div>
        <div className="text-sm text-[var(--gold)] mt-1">
          {lang === 'zh' ? '大师共识评分' : 'Master Consensus Score'}
        </div>
      </div>
      <div className="flex gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-400">{consensus.buy_count}</div>
          <div className="text-xs text-gray-500">{lang === 'zh' ? '买入' : 'Buy'}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{consensus.hold_count}</div>
          <div className="text-xs text-gray-500">{lang === 'zh' ? '观察' : 'Hold'}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">{consensus.pass_count}</div>
          <div className="text-xs text-gray-500">{lang === 'zh' ? '放弃' : 'Pass'}</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create WallStreetReport.jsx**

```jsx
export default function WallStreetReport({ report, lang = 'zh' }) {
  return (
    <div className="space-y-6">
      <Section title={lang === 'zh' ? '商业模式' : 'Business Model'} content={report.business_model} />
      <Section title={lang === 'zh' ? '财务健康' : 'Financial Health'} content={report.financial_health.details} score={report.financial_health.score} />
      <Section title={lang === 'zh' ? '护城河分析' : 'Moat Analysis'} content={report.moat.details} score={report.moat.score} badge={report.moat.type} />
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-3">{lang === 'zh' ? 'DCF 估值' : 'DCF Valuation'}</h3>
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div><div className="text-xl font-bold text-white">${report.dcf_valuation.fair_value}</div><div className="text-xs text-gray-500">{lang === 'zh' ? '公允价值' : 'Fair Value'}</div></div>
          <div><div className="text-xl font-bold text-emerald-400">{report.dcf_valuation.upside}</div><div className="text-xs text-gray-500">{lang === 'zh' ? '上行空间' : 'Upside'}</div></div>
        </div>
        <p className="text-sm text-gray-400">{report.dcf_valuation.assumptions}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-5">
          <h3 className="text-emerald-400 font-semibold mb-2">{lang === 'zh' ? '多头观点' : 'Bull Case'}</h3>
          <p className="text-sm text-gray-400">{report.bull_case}</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-5">
          <h3 className="text-red-400 font-semibold mb-2">{lang === 'zh' ? '空头观点' : 'Bear Case'}</h3>
          <p className="text-sm text-gray-400">{report.bear_case}</p>
        </div>
      </div>
      <Section title={lang === 'zh' ? '财报分析' : 'Earnings Analysis'} content={report.earnings_analysis} />
    </div>
  );
}

function Section({ title, content, score, badge }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-white font-semibold">{title}</h3>
        {score && <span className="text-xs bg-[var(--gold)]/10 text-[var(--gold)] px-2 py-0.5 rounded">{score}/10</span>}
        {badge && <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">{badge}</span>}
      </div>
      <p className="text-sm text-gray-400 leading-relaxed">{content}</p>
    </div>
  );
}
```

- [ ] **Step 6: Create TradePlan.jsx**

```jsx
export default function TradePlan({ plan, lang = 'zh' }) {
  return (
    <div className="bg-white/[0.03] border border-[var(--gold)]/15 rounded-2xl p-6">
      <h3 className="text-[var(--gold)] font-semibold mb-1">
        {lang === 'zh' ? '教育性交易情景模拟' : 'Educational Trade Simulation'}
      </h3>
      <p className="text-xs text-gray-500 mb-4">{plan.disclaimer}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric label={lang === 'zh' ? '进场区间' : 'Entry Range'} value={`$${plan.entry_range.low} - $${plan.entry_range.high}`} />
        <Metric label={lang === 'zh' ? '止损' : 'Stop Loss'} value={`$${plan.stop_loss.price}`} sub={plan.stop_loss.logic} color="text-red-400" />
        <Metric label={lang === 'zh' ? '仓位建议' : 'Position Size'} value={plan.position_size} />
        <Metric label={lang === 'zh' ? '持有周期' : 'Time Horizon'} value={plan.time_horizon} />
      </div>
      {plan.take_profit && plan.take_profit.length > 0 && (
        <div className="mt-4 flex gap-3">
          {plan.take_profit.map((tp, i) => (
            <div key={i} className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg px-4 py-2">
              <div className="text-sm text-emerald-400 font-semibold">${tp.price}</div>
              <div className="text-xs text-gray-500">{lang === 'zh' ? '止盈' : 'TP'} {tp.ratio}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, sub, color = 'text-white' }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-sm font-semibold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}
```

- [ ] **Step 7: Build the Analyze page**

Replace `frontend/src/pages/Analyze.jsx`:

```jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { analyzeStock } from '../services/api';
import VerdictGrid from '../components/VerdictGrid';
import ConsensusScore from '../components/ConsensusScore';
import WallStreetReport from '../components/WallStreetReport';
import TradePlan from '../components/TradePlan';

export default function Analyze() {
  const { ticker } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lang = 'zh';

  useEffect(() => {
    setLoading(true);
    setError(null);
    analyzeStock(ticker, lang)
      .then((res) => setReport(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Analysis failed'))
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) {
    return (
      <div className="pt-24 text-center">
        <div className="text-[var(--gold)] text-xl font-semibold mb-4">正在分析 {ticker.toUpperCase()}...</div>
        <div className="text-gray-500">10位大师正在独立裁决，预计需要30-60秒</div>
        <div className="mt-8 w-12 h-12 border-4 border-[var(--gold)]/30 border-t-[var(--gold)] rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error) {
    return <div className="pt-24 text-center text-red-400">{error}</div>;
  }

  if (!report) return null;

  return (
    <div className="pt-20 pb-16 max-w-6xl mx-auto px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">{report.company_name}</h1>
          <span className="font-mono text-gray-500">{report.ticker} · {report.exchange} · {report.currency} {report.price}</span>
        </div>
        <div className="text-right text-xs text-gray-500">
          {new Date(report.generated_at).toLocaleDateString()}
        </div>
      </div>

      {/* Consensus */}
      <div className="mb-8">
        <ConsensusScore consensus={report.consensus} lang={lang} />
      </div>

      {/* Master Verdicts */}
      <h2 className="text-xl font-serif font-bold text-white mb-4">大师裁决</h2>
      <div className="mb-10">
        <VerdictGrid verdicts={report.master_verdicts} lang={lang} />
      </div>

      {/* Wall Street Report */}
      <h2 className="text-xl font-serif font-bold text-white mb-4">华尔街深度报告</h2>
      <div className="mb-10">
        <WallStreetReport report={report.wall_street_report} lang={lang} />
      </div>

      {/* Trade Plan */}
      <h2 className="text-xl font-serif font-bold text-white mb-4">交易计划</h2>
      <TradePlan plan={report.trade_plan} lang={lang} />

      {/* Data Sources */}
      <div className="mt-10 text-xs text-gray-600">
        <p className="mb-1 font-semibold">数据来源：</p>
        {report.data_sources.map((s, i) => (
          <span key={i} className="mr-4">{s.label} ({s.field})</span>
        ))}
        <p className="mt-4 text-gray-600">本平台提供的所有分析内容均为教育性质，不构成投资建议。投资有风险，入市需谨慎。</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Update Home page with TickerInput**

Replace `frontend/src/pages/Home.jsx`:

```jsx
import TickerInput from '../components/TickerInput';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl mx-auto px-6 text-center">
        <h1 className="text-4xl font-serif font-bold text-white mb-4">
          用大师的眼光<br />看每一只股票
        </h1>
        <p className="text-gray-400 mb-8">
          输入股票代码，60秒获得巴菲特、格雷厄姆、林奇等10位大师的独立裁决
        </p>
        <TickerInput />
        <p className="text-xs text-gray-600 mt-4">支持美股 · 港股 | 教育性内容，非投资建议</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Test end-to-end**

Run backend: `cd backend && uvicorn app.main:app --reload --port 8000`
Run frontend: `cd frontend && npm run dev`
Visit: `http://localhost:5173`
Enter `AAPL` in the ticker input, submit.
Expected: Loading spinner → full report with 10 master verdicts, Wall Street report, trade plan.

- [ ] **Step 10: Commit**

```bash
git add frontend/
git commit -m "feat: build Analyze page with master verdicts, report, and trade plan UI"
```

---

## Task 11: Login Page + Dashboard

**Files:**
- Modify: `frontend/src/pages/Login.jsx`
- Modify: `frontend/src/pages/Dashboard.jsx`

- [ ] **Step 1: Build Login page**

Replace `frontend/src/pages/Login.jsx`:

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const res = await api.post(endpoint, { email, password });
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('user_email', res.data.email);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-[var(--navy-light)] border border-[var(--gold)]/15 rounded-2xl p-8">
        <h2 className="text-2xl font-serif font-bold text-white text-center mb-6">
          {isRegister ? '创建账户' : '登录'}
        </h2>
        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="邮箱" required
            className="w-full bg-[var(--navy)] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[var(--gold)]" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" required minLength={6}
            className="w-full bg-[var(--navy)] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[var(--gold)]" />
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dim)] text-[var(--navy)] rounded-lg py-3 font-bold disabled:opacity-50">
            {loading ? '处理中...' : isRegister ? '注册' : '登录'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          {isRegister ? '已有账户？' : '没有账户？'}
          <button onClick={() => setIsRegister(!isRegister)} className="text-[var(--gold)] ml-1">
            {isRegister ? '登录' : '注册'}
          </button>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build Dashboard page**

Replace `frontend/src/pages/Dashboard.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWatchlist, getReports, removeFromWatchlist, addToWatchlist } from '../services/api';

export default function Dashboard() {
  const [watchlist, setWatchlist] = useState([]);
  const [reports, setReports] = useState([]);
  const [newTicker, setNewTicker] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    getWatchlist().then(r => setWatchlist(r.data)).catch(() => {});
    getReports().then(r => setReports(r.data)).catch(() => {});
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTicker.trim()) return;
    try {
      await addToWatchlist(newTicker.trim());
      setNewTicker('');
      const r = await getWatchlist();
      setWatchlist(r.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed');
    }
  };

  const handleRemove = async (ticker) => {
    await removeFromWatchlist(ticker);
    setWatchlist(watchlist.filter(w => w.ticker !== ticker));
  };

  return (
    <div className="pt-20 pb-16 max-w-4xl mx-auto px-6">
      <h1 className="text-2xl font-serif font-bold text-white mb-8">我的面板</h1>

      {/* Watchlist */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--gold)] mb-4">自选股</h2>
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input value={newTicker} onChange={e => setNewTicker(e.target.value.toUpperCase())} placeholder="添加股票代码..."
            className="flex-1 bg-[var(--navy)] border border-white/10 rounded-lg px-4 py-2 text-white font-mono outline-none focus:border-[var(--gold)]" />
          <button type="submit" className="bg-[var(--gold)] text-[var(--navy)] px-4 py-2 rounded-lg font-bold text-sm">添加</button>
        </form>
        <div className="flex flex-wrap gap-2">
          {watchlist.map(w => (
            <div key={w.ticker} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
              <Link to={`/analyze/${w.ticker}`} className="font-mono text-sm text-white hover:text-[var(--gold)]">{w.ticker}</Link>
              <button onClick={() => handleRemove(w.ticker)} className="text-red-400 text-xs hover:text-red-300">×</button>
            </div>
          ))}
          {watchlist.length === 0 && <p className="text-sm text-gray-500">还没有自选股</p>}
        </div>
      </div>

      {/* Report History */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--gold)] mb-4">历史报告</h2>
        <div className="space-y-2">
          {reports.map(r => (
            <Link key={r.id} to={`/analyze/${r.ticker}`}
              className="flex justify-between items-center bg-white/5 border border-white/5 rounded-lg px-4 py-3 hover:border-[var(--gold)]/20 transition">
              <span className="font-mono text-white">{r.ticker}</span>
              <span className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</span>
            </Link>
          ))}
          {reports.length === 0 && <p className="text-sm text-gray-500">还没有历史报告</p>}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/
git commit -m "feat: add Login page and Dashboard with watchlist and report history"
```

---

## Task 12: Pricing Page + Stripe Integration

**Files:**
- Modify: `frontend/src/pages/Pricing.jsx`

- [ ] **Step 1: Build Pricing page**

Replace `frontend/src/pages/Pricing.jsx`:

```jsx
import { createCheckout } from '../services/api';

const plans = [
  { id: 'free', name: '免费版', price: '$0', period: '', desc: '体验大师级分析', features: ['每月 3 份报告', '5 维度评分', '10 只自选股', '2 次大师判断/月', '教育内容'], btn: '当前方案', outline: true },
  { id: 'single_report', name: '单报告', price: '$9', period: '/份', desc: '按需购买', features: ['完整深度报告', '大师裁决 + DCF', '交易计划', '30 天访问', 'PDF 导出'], btn: '购买', outline: true },
  { id: 'pro_monthly', name: 'Pro', price: '$19', period: '/月', desc: '$179/年省25%', features: ['无限报告', '完整裁决', 'AI 对话', '组合透视', '交易执行层', '无限自选股'], btn: '升级到 Pro', featured: true },
  { id: 'lifetime', name: '创始终身', price: '$299', period: '', desc: '一次付费永久', features: ['Pro 全部功能', '永久访问', '优先新功能', '创始标识', '限量 500'], btn: '锁定终身', outline: true },
];

export default function Pricing() {
  const handleCheckout = async (productType) => {
    const token = localStorage.getItem('access_token');
    if (!token) { window.location.href = '/login'; return; }
    try {
      const res = await createCheckout(productType);
      window.location.href = res.data.checkout_url;
    } catch (err) {
      alert(err.response?.data?.detail || 'Checkout failed');
    }
  };

  return (
    <div className="pt-24 pb-16 max-w-5xl mx-auto px-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-serif font-bold text-white mb-3">选择你的投资伙伴</h1>
        <p className="text-gray-400">比 Seeking Alpha 便宜 40%，功能更强大</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map(plan => (
          <div key={plan.id} className={`rounded-2xl p-7 text-center relative transition hover:-translate-y-1 ${plan.featured ? 'bg-white/[0.04] border-2 border-[var(--gold)] shadow-lg shadow-[var(--gold)]/5 scale-[1.02]' : 'bg-white/[0.02] border border-white/10'}`}>
            {plan.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dim)] text-[var(--navy)] px-4 py-1 rounded-full text-xs font-bold">最受欢迎</div>}
            <h3 className="text-white font-bold text-lg mt-2">{plan.name}</h3>
            <div className="text-3xl font-serif font-black text-white my-2">{plan.price}<span className="text-sm text-gray-500 font-normal">{plan.period}</span></div>
            <p className="text-xs text-gray-500 mb-5">{plan.desc}</p>
            <ul className="text-left space-y-2 mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="text-emerald-400 mt-0.5">✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => plan.id !== 'free' && handleCheckout(plan.id)}
              className={`w-full py-3 rounded-xl font-bold text-sm transition ${plan.featured ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dim)] text-[var(--navy)] hover:shadow-lg hover:shadow-[var(--gold)]/20' : 'bg-transparent border border-white/10 text-white hover:border-[var(--gold)] hover:text-[var(--gold)]'}`}>
              {plan.btn}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/
git commit -m "feat: add Pricing page with Stripe checkout integration"
```

---

## Task 13: Final Integration + Push

**Files:**
- Create: `frontend/.env.example`
- Modify: various cleanup

- [ ] **Step 1: Create frontend .env.example**

```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 2: Verify full app works end-to-end**

Run backend: `cd backend && uvicorn app.main:app --reload --port 8000`
Run frontend: `cd frontend && npm run dev`

Test flow:
1. Visit `/` → see ticker input
2. Enter `MSFT` → navigate to `/analyze/MSFT` → see loading → see full report
3. Visit `/login` → register → redirect to `/dashboard`
4. Add `AAPL` to watchlist → see it appear
5. Visit `/pricing` → see 4 pricing tiers

- [ ] **Step 3: Final commit and push**

```bash
git add -A
git commit -m "feat: complete MasterLens MVP — full-stack AI investment analysis platform"
git push origin master
```
