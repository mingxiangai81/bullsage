import { generateText } from 'ai';
import { createUserSupabaseClient } from '../_lib/supabase.js';

export const config = { runtime: 'edge' };

const TRIAL_LIMIT = 3;

// ── Yahoo Finance data ──────────────────────────────────────────────────────
async function fetchFinancialData(ticker) {
  try {
    const modules = 'financialData,defaultKeyStatistics,summaryDetail,price,assetProfile';
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=${modules}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`);
    const json = await res.json();
    const r = json?.quoteSummary?.result?.[0];
    if (!r) throw new Error('No data from Yahoo Finance');

    const p = r.price || {};
    const fd = r.financialData || {};
    const ks = r.defaultKeyStatistics || {};
    const sd = r.summaryDetail || {};
    const ap = r.assetProfile || {};

    return {
      ticker: ticker.toUpperCase(),
      company_name: p.longName || p.shortName || ticker,
      price: p.regularMarketPrice?.raw || 0,
      currency: p.currency || 'USD',
      exchange: p.exchangeName || '',
      market_cap: p.marketCap?.raw,
      pe_ratio: sd.trailingPE?.raw || ks.forwardPE?.raw,
      pb_ratio: ks.priceToBook?.raw,
      peg_ratio: ks.pegRatio?.raw,
      eps: ks.trailingEps?.raw,
      dividend_yield: sd.dividendYield?.raw,
      week_52_high: sd.fiftyTwoWeekHigh?.raw,
      week_52_low: sd.fiftyTwoWeekLow?.raw,
      revenue: fd.totalRevenue?.raw,
      gross_margins: fd.grossMargins?.raw,
      operating_margins: fd.operatingMargins?.raw,
      profit_margins: fd.profitMargins?.raw,
      revenue_growth: fd.revenueGrowth?.raw,
      earnings_growth: fd.earningsGrowth?.raw,
      roe: fd.returnOnEquity?.raw,
      roa: fd.returnOnAssets?.raw,
      free_cash_flow: fd.freeCashflow?.raw,
      total_debt: fd.totalDebt?.raw,
      debt_to_equity: fd.debtToEquity?.raw,
      current_ratio: fd.currentRatio?.raw,
      sector: ap.sector || '',
      industry: ap.industry || '',
      description: ap.longBusinessSummary?.slice(0, 500) || '',
      beta: ks.beta?.raw,
      shares_outstanding: ks.sharesOutstanding?.raw,
    };
  } catch (err) {
    // Return minimal data if Yahoo Finance fails
    return { ticker: ticker.toUpperCase(), company_name: ticker, price: 0, currency: 'USD', exchange: '' };
  }
}

function buildFinancialSummary(d) {
  const fmt = (n, isPercent = false) => {
    if (n == null) return 'N/A';
    if (isPercent) return (n * 100).toFixed(1) + '%';
    if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    return n.toFixed(2);
  };
  return [
    `Company: ${d.company_name} (${d.ticker})`,
    `Price: ${d.currency} ${fmt(d.price)} | Market Cap: ${fmt(d.market_cap)}`,
    `P/E: ${fmt(d.pe_ratio)} | P/B: ${fmt(d.pb_ratio)} | PEG: ${fmt(d.peg_ratio)} | EPS: ${fmt(d.eps)}`,
    `Dividend Yield: ${fmt(d.dividend_yield, true)} | Beta: ${fmt(d.beta)}`,
    `52W High: ${fmt(d.week_52_high)} | 52W Low: ${fmt(d.week_52_low)}`,
    `Revenue: ${fmt(d.revenue)} | Revenue Growth: ${fmt(d.revenue_growth, true)}`,
    `Gross Margin: ${fmt(d.gross_margins, true)} | Operating Margin: ${fmt(d.operating_margins, true)} | Net Margin: ${fmt(d.profit_margins, true)}`,
    `ROE: ${fmt(d.roe, true)} | ROA: ${fmt(d.roa, true)} | Free Cash Flow: ${fmt(d.free_cash_flow)}`,
    `Total Debt: ${fmt(d.total_debt)} | D/E: ${fmt(d.debt_to_equity)} | Current Ratio: ${fmt(d.current_ratio)}`,
    `Sector: ${d.sector} | Industry: ${d.industry}`,
    d.description ? `Business: ${d.description}` : '',
  ].filter(Boolean).join('\n');
}

function buildPrompt(fd, lang) {
  const isZh = lang === 'zh';
  const langInstr = isZh ? 'Write ALL reasoning fields in Chinese (简体中文).' : 'Write ALL reasoning fields in English.';
  const summary = buildFinancialSummary(fd);

  return `You are generating a comprehensive investment analysis report for ${fd.company_name} (${fd.ticker}).

Financial Data:
${summary}

Generate a complete JSON report with this EXACT structure (no markdown, pure JSON):
{
  "ticker": "${fd.ticker}",
  "company_name": "${fd.company_name}",
  "price": ${fd.price || 0},
  "currency": "${fd.currency}",
  "exchange": "${fd.exchange}",
  "language": "${lang}",
  "master_verdicts": [
    {
      "master_name": "Warren Buffett",
      "master_name_zh": "沃伦·巴菲特",
      "framework": "Owner Earnings Model",
      "framework_zh": "所有者收益模型",
      "verdict": "buy" or "hold" or "pass",
      "score": <float 1-10>,
      "reasoning_en": "<2-3 sentences as Buffett, first person, folksy>",
      "reasoning_zh": "<same in Chinese as Buffett>",
      "key_metric": "<most relevant metric with value>"
    },
    {
      "master_name": "Benjamin Graham",
      "master_name_zh": "本杰明·格雷厄姆",
      "framework": "Margin of Safety & Graham Number",
      "framework_zh": "安全边际与格雷厄姆数值",
      "verdict": "buy" or "hold" or "pass",
      "score": <float 1-10>,
      "reasoning_en": "<2-3 sentences as Graham, scholarly, conservative>",
      "reasoning_zh": "<same in Chinese>",
      "key_metric": "<P/E vs threshold or Graham Number vs price>"
    },
    {
      "master_name": "Peter Lynch",
      "master_name_zh": "彼得·林奇",
      "framework": "PEG / GARP",
      "framework_zh": "PEG / GARP 成长合理价",
      "verdict": "buy" or "hold" or "pass",
      "score": <float 1-10>,
      "reasoning_en": "<2-3 sentences as Lynch, casual, everyday analogies>",
      "reasoning_zh": "<same in Chinese>",
      "key_metric": "<PEG ratio and stock category>"
    },
    {
      "master_name": "Charlie Munger",
      "master_name_zh": "查理·芒格",
      "framework": "Mental Models Checklist",
      "framework_zh": "心智模式清单",
      "verdict": "buy" or "hold" or "pass",
      "score": <float 1-10>,
      "reasoning_en": "<2-3 sentences as Munger, blunt, witty>",
      "reasoning_zh": "<same in Chinese>",
      "key_metric": "<key mental model applied>"
    },
    {
      "master_name": "Philip Fisher",
      "master_name_zh": "菲利普·费雪",
      "framework": "Scuttlebutt 15 Points",
      "framework_zh": "精挑细选十五要点",
      "verdict": "buy" or "hold" or "pass",
      "score": <float 1-10>,
      "reasoning_en": "<2-3 sentences as Fisher, growth-focused>",
      "reasoning_zh": "<same in Chinese>",
      "key_metric": "<R&D or margin trend>"
    },
    {
      "master_name": "Joel Greenblatt",
      "master_name_zh": "乔尔·格林布拉特",
      "framework": "Magic Formula",
      "framework_zh": "神奇公式",
      "verdict": "buy" or "hold" or "pass",
      "score": <float 1-10>,
      "reasoning_en": "<2-3 sentences as Greenblatt, systematic, quantitative>",
      "reasoning_zh": "<same in Chinese>",
      "key_metric": "<Earnings Yield or ROC>"
    },
    {
      "master_name": "Ray Dalio",
      "master_name_zh": "瑞·达利欧",
      "framework": "Debt Cycle & All-Weather",
      "framework_zh": "债务周期与全天候策略",
      "verdict": "buy" or "hold" or "pass",
      "score": <float 1-10>,
      "reasoning_en": "<2-3 sentences as Dalio, macro, principled>",
      "reasoning_zh": "<same in Chinese>",
      "key_metric": "<D/E or cyclicality>"
    },
    {
      "master_name": "Cathie Wood",
      "master_name_zh": "凯西·伍德",
      "framework": "Disruptive Innovation",
      "framework_zh": "颠覆性创新",
      "verdict": "buy" or "hold" or "pass",
      "score": <float 1-10>,
      "reasoning_en": "<2-3 sentences as Wood, innovation-bullish, 5-year horizon>",
      "reasoning_zh": "<same in Chinese>",
      "key_metric": "<TAM or innovation platform>"
    },
    {
      "master_name": "John Bogle",
      "master_name_zh": "约翰·博格尔",
      "framework": "Index Investing Principles",
      "framework_zh": "指数化投资原则",
      "verdict": "buy" or "hold" or "pass",
      "score": <float 1-10>,
      "reasoning_en": "<2-3 sentences as Bogle, skeptical of stock-picking, cost-focused>",
      "reasoning_zh": "<same in Chinese>",
      "key_metric": "<dividend yield vs index or cost>"
    },
    {
      "master_name": "Seth Klarman",
      "master_name_zh": "塞斯·卡拉曼",
      "framework": "Deep Value & Risk Management",
      "framework_zh": "深度价值与风险管理",
      "verdict": "buy" or "hold" or "pass",
      "score": <float 1-10>,
      "reasoning_en": "<2-3 sentences as Klarman, patient, risk-averse>",
      "reasoning_zh": "<same in Chinese>",
      "key_metric": "<margin of safety or catalyst>"
    }
  ],
  "consensus": {
    "score": <weighted average of all 10 scores, 1 decimal>,
    "buy_count": <number>,
    "hold_count": <number>,
    "pass_count": <number>,
    "summary_en": "<1 sentence summary in English>",
    "summary_zh": "<1 sentence summary in Chinese>"
  },
  "wall_street_report": {
    "business_model": "<1 paragraph in ${isZh ? 'Chinese' : 'English'}>",
    "financial_health": {
      "score": <int 1-10>,
      "details": "<1 paragraph in ${isZh ? 'Chinese' : 'English'}>"
    },
    "moat": {
      "score": <int 1-10>,
      "type": "<Brand/Network Effect/Switching Cost/Cost Advantage/Intangibles/Efficient Scale>",
      "details": "<1 paragraph in ${isZh ? 'Chinese' : 'English'}>"
    },
    "dcf_valuation": {
      "fair_value": <float, estimated fair value per share>,
      "upside": "<e.g. +12% or -8% from current price>",
      "assumptions": "<key assumptions in ${isZh ? 'Chinese' : 'English'}>"
    },
    "bull_case": "<1 paragraph in ${isZh ? 'Chinese' : 'English'}>",
    "bear_case": "<1 paragraph in ${isZh ? 'Chinese' : 'English'}>",
    "earnings_analysis": "<1 paragraph in ${isZh ? 'Chinese' : 'English'}>"
  },
  "trade_plan": {
    "disclaimer": "${isZh ? '本内容为教育性情景模拟，不构成投资建议。' : 'Educational simulation only, not investment advice.'}",
    "entry_range": { "low": <float>, "high": <float> },
    "stop_loss": { "price": <float>, "logic": "<reason in ${isZh ? 'Chinese' : 'English'}>" },
    "take_profit": [
      { "price": <float>, "ratio": "50%" },
      { "price": <float>, "ratio": "50%" }
    ],
    "position_size": "${isZh ? '建议不超过投资组合的5%' : 'Suggested max 5% of portfolio'}",
    "time_horizon": "${isZh ? '12-18个月' : '12-18 months'}"
  },
  "data_sources": [
    { "label": "Yahoo Finance real-time", "field": "price, fundamentals" },
    { "label": "${fd.company_name} public filings", "field": "financials" }
  ]
}

${langInstr}
Be specific with real numbers from the financial data. Return ONLY valid JSON, no explanation text.`;
}

// ── Main handler ────────────────────────────────────────────────────────────
export default async function handler(request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const ticker = pathParts[pathParts.length - 1].toUpperCase();
  const lang = url.searchParams.get('lang') || 'zh';
  const token = request.headers.get('authorization')?.split(' ')[1];

  // Auth + trial check
  let authedUser = null;
  let userSupabase = null;
  if (token) {
    try {
      const supabase = createUserSupabaseClient(token);
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        authedUser = user;
        userSupabase = supabase;
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile?.is_trial) {
          if (profile.trial_reports_used >= TRIAL_LIMIT) {
            return Response.json({ detail: 'TRIAL_LIMIT|You have used all 3 free trial queries. Upgrade to continue.' }, { status: 403 });
          }
          if (profile.trial_expires_at && new Date(profile.trial_expires_at) < new Date()) {
            return Response.json({ detail: 'TRIAL_EXPIRED|Your 7-day free trial has ended. Upgrade to continue.' }, { status: 403 });
          }
          // Increment usage
          await supabase.from('profiles').update({
            trial_reports_used: (profile.trial_reports_used || 0) + 1,
          }).eq('id', user.id);
        }
      }
    } catch (_) { /* proceed without auth */ }
  }

  try {
    // Fetch financial data from Yahoo Finance
    const fd = await fetchFinancialData(ticker);

    // Generate full report via Vercel AI Gateway (Gemini)
    const { text } = await generateText({
      model: 'google/gemini-2.5-pro',
      prompt: buildPrompt(fd, lang),
      maxTokens: 8000,
    });

    // Parse JSON response
    let report;
    try {
      // Strip markdown code blocks if present
      const cleaned = text.replace(/^```json\n?/m, '').replace(/^```\n?/m, '').replace(/```$/m, '').trim();
      report = JSON.parse(cleaned);
    } catch {
      return Response.json({ detail: 'Failed to parse AI response. Please retry.' }, { status: 500 });
    }

    // Add generated_at timestamp
    report.generated_at = new Date().toISOString();

    // Save to report history for logged-in users (best-effort, doesn't block response)
    if (authedUser && userSupabase) {
      try {
        await userSupabase.from('reports').insert({
          user_id: authedUser.id,
          ticker,
          language: lang,
          report_data: report,
        });
      } catch (_) { /* history is non-critical */ }
    }

    return Response.json(report, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400', // Cache 24h
      },
    });
  } catch (err) {
    return Response.json({ detail: `Analysis failed: ${err.message}` }, { status: 500 });
  }
}
