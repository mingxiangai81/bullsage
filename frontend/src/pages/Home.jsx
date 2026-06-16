import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useLang from '../hooks/useLang';
import './Home.css';

const PLACEHOLDERS_ZH = ['例如 AAPL', '例如 TSLA', '例如 0700.HK', '例如 NVDA', '例如 BABA'];
const PLACEHOLDERS_EN = ['e.g. AAPL', 'e.g. TSLA', 'e.g. 0700.HK', 'e.g. NVDA', 'e.g. BABA'];

export default function Home() {
  const [lang] = useLang();
  const navigate = useNavigate();
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const fadeRefs = useRef([]);

  // Intersection observer for fade-up animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    const els = document.querySelectorAll('.fade-up');
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Cycling placeholder
  useEffect(() => {
    const id = setInterval(() => setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS_ZH.length), 3000);
    return () => clearInterval(id);
  }, []);

  const handleGo = useCallback(() => {
    const val = ticker.trim().toUpperCase();
    if (!val) return;
    setLoading(true);
    setTimeout(() => navigate(`/analyze/${val}`), 400);
  }, [ticker, navigate]);

  const handleKey = useCallback((e) => { if (e.key === 'Enter') handleGo(); }, [handleGo]);

  const zh = lang === 'zh';
  const placeholder = zh ? PLACEHOLDERS_ZH[placeholderIdx] : PLACEHOLDERS_EN[placeholderIdx];

  return (
    <div className="home-page">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="dot" />
              {zh ? '全球首个中英双语 AI 投资裁决引擎' : "World's First Bilingual AI Investment Verdict Engine"}
            </div>
            <h1>
              {zh ? <>用大师的眼光<br />看每一只股票</> : <>See Every Stock<br />Through Masters' Eyes</>}
              <span className="line2">
                {zh
                  ? '巴菲特 · 格雷厄姆 · 林奇 · 芒格 — 10位传奇投资大师，60秒AI裁决'
                  : 'Buffett · Graham · Lynch · Munger — 10 Legendary Masters, 60-Second AI Verdict'}
              </span>
            </h1>
            <p className="hero-sub">
              {zh
                ? <><strong>华尔街级深度报告</strong>、<strong>多大师框架裁决</strong>和<strong>可执行交易计划</strong>。所有数据均附原文引用，拒绝 AI 幻觉。</>
                : <>Wall Street-grade reports, <strong>multi-master framework verdicts</strong>, and <strong>actionable trade plans</strong>. Every data point cited. Zero AI hallucination.</>}
            </p>
            <div className="ticker-box">
              <div className="ticker-box-inner">
                <div className="ticker-label">
                  {zh ? '输入股票代码，开始你的大师级分析' : 'Enter a stock ticker to begin your master-level analysis'}
                </div>
                <div className="ticker-input-row">
                  <input
                    className="ticker-input"
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={placeholder}
                    maxLength={10}
                  />
                  <button className="ticker-go" onClick={handleGo} disabled={loading}>
                    {loading ? (zh ? '分析中…' : 'Analyzing…') : (zh ? '获取裁决' : 'Get Verdict')}
                  </button>
                </div>
                <div className="ticker-hint">
                  <span>{zh ? '支持美股 · 港股 · A股' : 'US · HK · CN Markets'}</span>
                  <span className="keys">
                    <span className="key">AAPL</span>
                    <span className="key">0700.HK</span>
                    <span className="key">BABA</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-demo">
            <div className="demo-card">
              <div className="demo-header">
                <div className="demo-stock">
                  <div className="demo-stock-icon">🍎</div>
                  <div>
                    <div className="demo-stock-name">Apple Inc.</div>
                    <div className="demo-stock-ticker">NASDAQ: AAPL</div>
                  </div>
                </div>
                <div className="demo-price">
                  <div className="demo-price-val">$198.36</div>
                  <div className="demo-price-chg">+1.24%</div>
                </div>
              </div>
              <div className="demo-verdicts">
                {[
                  { av: 'WB', avColor: 'rgba(52,211,153,0.15)', avText: '#34d399', name: zh ? '巴菲特' : 'Buffett', framework: zh ? '所有者收益模型' : 'Owner Earnings', tag: 'buy', label: zh ? '买入' : 'BUY' },
                  { av: 'BG', avColor: 'rgba(234,179,8,0.15)', avText: '#eab308', name: zh ? '格雷厄姆' : 'Graham', framework: zh ? '安全边际' : 'Margin of Safety', tag: 'hold', label: zh ? '观察' : 'HOLD' },
                  { av: 'PL', avColor: 'rgba(96,165,250,0.15)', avText: '#60a5fa', name: zh ? '林奇' : 'Lynch', framework: 'PEG/GARP', tag: 'hold', label: zh ? '观察' : 'HOLD' },
                  { av: 'PF', avColor: 'rgba(168,85,247,0.15)', avText: '#a855f7', name: zh ? '费雪' : 'Fisher', framework: zh ? '精挑细选' : 'Scuttlebutt', tag: 'buy', label: zh ? '买入' : 'BUY' },
                  { av: 'JG', avColor: 'rgba(248,113,113,0.15)', avText: '#f87171', name: zh ? '格林布拉特' : 'Greenblatt', framework: zh ? '神奇公式' : 'Magic Formula', tag: 'pass', label: zh ? '放弃' : 'PASS' },
                  { av: 'CM', avColor: 'rgba(52,211,153,0.15)', avText: '#34d399', name: zh ? '芒格' : 'Munger', framework: zh ? '心智模式' : 'Mental Models', tag: 'buy', label: zh ? '买入' : 'BUY' },
                ].map((m) => (
                  <div key={m.av} className="verdict-row">
                    <div className="verdict-avatar" style={{ background: m.avColor, color: m.avText }}>{m.av}</div>
                    <div className="verdict-name"><strong>{m.name}</strong> · {m.framework}</div>
                    <span className={`verdict-tag tag-${m.tag}`}>{m.label}</span>
                  </div>
                ))}
              </div>
              <div className="demo-consensus">
                <div>
                  <div className="consensus-label">{zh ? '大师共识评分' : 'Master Consensus'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="consensus-score">7.2 / 10</div>
                  <div className="consensus-detail">{zh ? '3 买入 · 2 观察 · 1 放弃' : '3 Buy · 2 Hold · 1 Pass'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="trust-bar">
        <div className="container">
          <div className="trust-items">
            {[
              { icon: '📑', zh: '每条数据附原文引用', en: 'Every Data Point Cited' },
              { icon: '🌏', zh: '中英双语原生体验', en: 'Native Bilingual Experience' },
              { icon: '🎓', zh: '教育性内容，非投资建议', en: 'Educational Content, Not Financial Advice' },
              { icon: '🔒', zh: '数据安全加密', en: 'Encrypted & Secure' },
            ].map((item) => (
              <div key={item.icon} className="trust-item">
                <div className="trust-icon">{item.icon}</div>
                <span>{zh ? item.zh : item.en}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PAIN POINTS ── */}
      <section className="pain-section" id="pain">
        <div className="container">
          <div className="section-header fade-up">
            <div className="overline">{zh ? '市场痛点' : 'Market Pain Points'}</div>
            <h2>{zh ? <>投资者正在忍受的 <span className="gold">五大困境</span></> : <>The <span className="gold">5 Frustrations</span> Every Investor Faces</>}</h2>
            <p>{zh ? '我们研究了数千条用户评论和社区反馈，找到了现有平台最致命的缺陷' : 'We analyzed thousands of user reviews to find the critical failures of existing platforms'}</p>
          </div>
          <div className="pain-grid">
            {[
              {
                icon: '🤥', color: 'red', delay: '',
                tagZh: '行业通病', tagEn: 'Industry-Wide',
                titleZh: 'AI 幻觉与数据错误', titleEn: 'AI Hallucinations & Data Errors',
                descZh: '同花顺问财对同一股票同时给出"最适合"和"最不适合"长期持有的矛盾评级；查宁德时代却返回平安银行的数据。',
                descEn: 'Leading platforms generate contradictory ratings for the same stock and return wrong company\'s financials — destroying user trust.',
                solZh: 'BullSage 方案：RAG 引用溯源架构，每个数字链接到年报原文页码',
                solEn: 'BullSage: RAG-powered citations linking every number to annual report pages',
              },
              {
                icon: '📊', color: 'yellow', delay: 'delay-1',
                tagZh: '普遍反馈', tagEn: 'Universal',
                titleZh: '信息过载，没有行动指导', titleEn: 'Data Overload, No Action Plan',
                descZh: 'Morningstar、YCharts 数据密密麻麻，用户真正想知道的是："这只股票能不能买？买多少？何时止损？"',
                descEn: 'Platforms overwhelm with dashboards. Users want: "Should I buy? How much? Where\'s my stop-loss?"',
                solZh: 'BullSage 方案：每份报告附带进场价位、止损逻辑、仓位建议的交易计划',
                solEn: 'BullSage: Every report includes entry price, stop-loss logic, and position sizing',
              },
              {
                icon: '🔒', color: 'blue', delay: 'delay-2',
                tagZh: '信任危机', tagEn: 'Trust Issue',
                titleZh: '付费墙不透明', titleEn: 'Opaque Paywalls',
                descZh: 'Motley Fool、Seeking Alpha 付费前看不到产品价值，付费后发现功能与预期不符。这是金融订阅类产品的头号投诉。',
                descEn: 'Top complaint: can\'t see product value before paying. After subscribing, features don\'t match expectations.',
                solZh: 'BullSage 方案：每月3份完整免费报告 + $9 单报告按需购买，先体验再决定',
                solEn: 'BullSage: 3 free reports/month + $9 single report purchase. Try before you commit.',
              },
              {
                icon: '🌐', color: 'green', delay: 'delay-3',
                tagZh: '华语投资者', tagEn: 'Chinese Investors',
                titleZh: '缺乏全球市场的中文专业工具', titleEn: 'No Professional Chinese Tools for Global Markets',
                descZh: '英文平台不支持中文；中文平台对美股/港股分析浅薄。巴菲特框架的中文化应用几乎为零。',
                descEn: 'English platforms don\'t support Chinese; Chinese platforms lack depth for US/HK stocks. Zero Chinese-language master frameworks.',
                solZh: 'BullSage 方案：原生双语，非机器翻译。大师语录英中对照，术语双语标注',
                solEn: 'BullSage: Native bilingual content (not machine-translated). Dual-language quotes & terms.',
              },
              {
                icon: '⚖️', color: 'purple', delay: 'delay-4',
                tagZh: '合规风险', tagEn: 'Compliance Risk',
                titleZh: 'AI 荐股的法律雷区', titleEn: 'AI Stock-Picking Legal Risks',
                descZh: '雪球因 AI 荐股被罚 8,300 万元。用户对 AI 直接荐股的信任度骤降，但对"教育性分析框架"的需求反而上升。',
                descEn: 'A major platform was fined ¥83M for AI stock-picking. Trust in direct recommendations plummeted, but demand for educational frameworks surged.',
                solZh: 'BullSage 方案：定位"教育性投资框架"，合规透明，教你用大师思维自主决策',
                solEn: 'BullSage: Positioned as "educational investment framework" — compliant, transparent, teaching master-level thinking.',
              },
            ].map((p) => (
              <div key={p.icon} className={`pain-card fade-up ${p.delay}`}>
                <div className={`pain-icon ${p.color}`}>{p.icon}</div>
                <div className="pain-problem">{zh ? p.tagZh : p.tagEn}</div>
                <h3>{zh ? p.titleZh : p.titleEn}</h3>
                <p className="pain-desc">{zh ? p.descZh : p.descEn}</p>
                <div className="pain-solution">
                  <span className="check">✓</span>
                  <p>{zh ? p.solZh : p.solEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUR SKILLS ── */}
      <section className="skills-section" id="skills">
        <div className="container">
          <div className="section-header fade-up">
            <div className="overline">{zh ? '核心能力' : 'Core Capabilities'}</div>
            <h2>{zh ? <>四大引擎，<span className="gold">一站整合</span></> : <>Four Engines, <span className="gold">One Platform</span></>}</h2>
            <p>{zh ? '市场上没有任何平台同时具备这四项能力——这是 BullSage 的唯一性所在' : 'No other platform combines all four — this is what makes BullSage unique'}</p>
          </div>
          <div className="skills-grid">
            {[
              {
                num: '01', icon: '📈', bg: 'rgba(96,165,250,0.12)', delay: '',
                titleZh: '华尔街级深度报告', titleEn: 'Wall Street Analysis', mono: 'wallstreet-analysis',
                descZh: '完整的机构级研究报告——商业模式、财务健康、护城河评分、DCF 估值、多空辩论、财报解读，带明确评级与目标价。',
                descEn: 'Institutional-grade reports: business model, financial health, moat scoring, DCF valuation, bull/bear debate, with clear ratings & price targets.',
                tags: [['DCF', 'DCF'], [zh ? '护城河' : 'Moat', zh ? '护城河' : 'Moat'], [zh ? '多空辩论' : 'Bull/Bear', zh ? '多空辩论' : 'Bull/Bear'], [zh ? '财报解读' : 'Earnings', zh ? '财报解读' : 'Earnings']],
              },
              {
                num: '02', icon: '🏛️', bg: 'rgba(201,168,76,0.12)', delay: 'delay-1',
                titleZh: '大师框架裁决引擎', titleEn: 'Master Verdict Engine', mono: 'investment-masters',
                descZh: '10位传奇大师的分析框架——巴菲特、芒格、格雷厄姆、林奇、费雪、格林布拉特、达利欧、伍德、博格尔，以大师语气输出裁决。',
                descEn: '10 legendary frameworks — Buffett, Munger, Graham, Lynch, Fisher, Greenblatt, Dalio, Wood, Bogle — verdicts delivered in each master\'s voice.',
                tags: [[zh ? '安全边际' : 'Margin of Safety', zh ? '安全边际' : 'Margin of Safety'], ['PEG/GARP', 'PEG/GARP'], [zh ? '神奇公式' : 'Magic Formula', zh ? '神奇公式' : 'Magic Formula'], [zh ? '共识评分' : 'Consensus', zh ? '共识评分' : 'Consensus']],
              },
              {
                num: '03', icon: '🎯', bg: 'rgba(52,211,153,0.12)', delay: 'delay-2',
                titleZh: '交易实战教练', titleEn: 'Trading Coach', mono: 'trading-coach',
                descZh: '从机会扫描到交易复盘的完整执行工作流——进场价位、止损逻辑、止盈目标、仓位建议，教育性模拟框架。',
                descEn: 'Complete execution workflow — entry prices, stop-loss logic, profit targets, position sizing. Educational simulation framework.',
                tags: [[zh ? '进场价位' : 'Entry', zh ? '进场价位' : 'Entry'], [zh ? '止损' : 'Stop-Loss', zh ? '止损' : 'Stop-Loss'], [zh ? '仓位管理' : 'Position Size', zh ? '仓位管理' : 'Position Size'], [zh ? '回测' : 'Backtest', zh ? '回测' : 'Backtest']],
              },
              {
                num: '04', icon: '⚡', bg: 'rgba(168,85,247,0.12)', delay: 'delay-3',
                titleZh: '交易提示框架', titleEn: 'Trading Prompts', mono: 'trading-prompts',
                descZh: '7大交易场景的结构化分析——选股挖掘、图表分析、新闻驱动、回测验证、组合风险、交易复盘、日清单。降低新用户门槛。',
                descEn: '7 structured trading scenarios — stock screening, chart analysis, news-driven, backtesting, portfolio risk, trade review, daily checklist.',
                tags: [[zh ? '选股' : 'Screening', zh ? '选股' : 'Screening'], [zh ? '图表' : 'Charts', zh ? '图表' : 'Charts'], [zh ? '新闻驱动' : 'News', zh ? '新闻驱动' : 'News'], [zh ? '复盘' : 'Review', zh ? '复盘' : 'Review']],
              },
            ].map((s) => (
              <div key={s.num} className={`skill-card fade-up ${s.delay}`}>
                <div className="skill-number">{s.num}</div>
                <div className="skill-icon-wrap" style={{ background: s.bg }}>{s.icon}</div>
                <h3>{zh ? s.titleZh : s.titleEn}</h3>
                <div className="skill-en">{s.mono}</div>
                <p>{zh ? s.descZh : s.descEn}</p>
                <div className="skill-tags">
                  {s.tags.map(([labelZh, labelEn]) => (
                    <span key={labelZh} className="skill-tag">{zh ? labelZh : labelEn}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MASTER VERDICT DEMO ── */}
      <section className="verdict-section" id="verdict">
        <div className="container">
          <div className="verdict-demo-wrap fade-up">
            <div className="verdict-demo-header">
              <div>
                <div className="overline" style={{ textAlign: 'left', marginBottom: 8 }}>{zh ? '产品演示' : 'Live Demo'}</div>
                <h2>{zh ? '大师裁决引擎实况' : 'Master Verdict Engine in Action'}</h2>
                <p>{zh ? '以 Apple (AAPL) 为例，看6位大师如何各抒己见' : 'See how 6 masters independently evaluate Apple (AAPL)'}</p>
              </div>
              <div className="verdict-stock-badge">
                <span style={{ fontSize: '1.4rem' }}>🍎</span>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', color: 'var(--white)', fontWeight: 600 }}>AAPL</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>$198.36 · NASDAQ</div>
                </div>
              </div>
            </div>

            <div className="verdict-masters">
              {[
                {
                  av: 'WB', avBg: 'rgba(52,211,153,0.15)', avColor: '#34d399', delay: '',
                  nameZh: '沃伦·巴菲特', nameEn: 'Warren Buffett',
                  fwZh: '所有者收益模型', fwEn: 'Owner Earnings Model',
                  quoteZh: '「苹果的服务业务护城河极深，品牌忠诚度是我最看重的。当前估值虽非便宜，但长期持有的信心不变。」',
                  quoteEn: '"Apple\'s services moat is extraordinary. Brand loyalty is what I value most. Valuation isn\'t cheap, but conviction for long-term holding remains."',
                  tag: 'buy', labelZh: '买入', labelEn: 'BUY', score: '8.5/10',
                },
                {
                  av: 'BG', avBg: 'rgba(234,179,8,0.15)', avColor: '#eab308', delay: 'delay-1',
                  nameZh: '本杰明·格雷厄姆', nameEn: 'Benjamin Graham',
                  fwZh: '安全边际 · 格雷厄姆数值', fwEn: 'Margin of Safety · Graham Number',
                  quoteZh: '「按格雷厄姆数值计算，当前股价溢价42%。安全边际不足，我会等待更好的价格。」',
                  quoteEn: '"By Graham Number, shares trade at a 42% premium. Insufficient margin of safety. I\'d wait for a better price."',
                  tag: 'hold', labelZh: '观察', labelEn: 'HOLD', score: '5.2/10',
                },
                {
                  av: 'PL', avBg: 'rgba(96,165,250,0.15)', avColor: '#60a5fa', delay: 'delay-2',
                  nameZh: '彼得·林奇', nameEn: 'Peter Lynch',
                  fwZh: 'PEG / GARP', fwEn: 'PEG / GARP',
                  quoteZh: '「PEG 比率2.1，不符合 GARP 标准。但增长可见度极高，服务收入的复合增长令人瞩目。」',
                  quoteEn: '"PEG ratio 2.1 doesn\'t meet GARP criteria. But growth visibility is exceptional — services revenue CAGR is impressive."',
                  tag: 'hold', labelZh: '观察', labelEn: 'HOLD', score: '6.0/10',
                },
                {
                  av: 'PF', avBg: 'rgba(168,85,247,0.15)', avColor: '#a855f7', delay: 'delay-1',
                  nameZh: '菲利普·费雪', nameEn: 'Philip Fisher',
                  fwZh: '精挑细选十五要点', fwEn: 'Scuttlebutt 15 Points',
                  quoteZh: '「研发投入持续增长，管理层对AI的战略布局清晰。符合我对杰出公司的定义。」',
                  quoteEn: '"R&D investment keeps growing. Management\'s AI strategy is clear. Meets my definition of an outstanding company."',
                  tag: 'buy', labelZh: '买入', labelEn: 'BUY', score: '8.0/10',
                },
                {
                  av: 'JG', avBg: 'rgba(248,113,113,0.15)', avColor: '#f87171', delay: 'delay-2',
                  nameZh: '乔尔·格林布拉特', nameEn: 'Joel Greenblatt',
                  fwZh: '神奇公式', fwEn: 'Magic Formula',
                  quoteZh: '「资本回报率优秀，但盈利收益率排名靠后。按神奇公式标准，有更便宜的优质标的。」',
                  quoteEn: '"Capital returns are strong, but earnings yield ranks poorly. By Magic Formula criteria, cheaper quality targets exist."',
                  tag: 'pass', labelZh: '放弃', labelEn: 'PASS', score: '4.8/10',
                },
                {
                  av: 'CM', avBg: 'rgba(201,168,76,0.15)', avColor: 'var(--gold)', delay: 'delay-3',
                  nameZh: '查理·芒格', nameEn: 'Charlie Munger',
                  fwZh: '心智模式清单', fwEn: 'Mental Models Checklist',
                  quoteZh: '「用逆向思维看，很难想象苹果生态在十年内被颠覆。为优质公司支付合理溢价是明智的。」',
                  quoteEn: '"Inverting: it\'s hard to imagine Apple\'s ecosystem disrupted within a decade. Paying a fair premium for quality is wise."',
                  tag: 'buy', labelZh: '买入', labelEn: 'BUY', score: '8.2/10',
                },
              ].map((m) => (
                <div key={m.av} className={`master-card fade-up ${m.delay}`}>
                  <div className="master-top">
                    <div className="master-av" style={{ background: m.avBg, color: m.avColor }}>{m.av}</div>
                    <div className="master-meta">
                      <h4>{zh ? m.nameZh : m.nameEn}</h4>
                      <span>{zh ? m.fwZh : m.fwEn}</span>
                    </div>
                  </div>
                  <div className="master-quote">{zh ? m.quoteZh : m.quoteEn}</div>
                  <div className="master-verdict">
                    <span className={`verdict-tag tag-${m.tag}`} style={{ fontSize: '0.85rem', padding: '5px 16px' }}>
                      {zh ? m.labelZh : m.labelEn}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{m.score}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="verdict-big">
              <div style={{ display: 'flex', justifyContent: 'center', gap: 48, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="verdict-big-score">7.2 <span style={{ fontSize: '1.2rem' }}>/10</span></div>
                  <div className="verdict-big-label">{zh ? '大师共识评分' : 'Master Consensus Score'}</div>
                </div>
                <div className="verdict-breakdown">
                  <div className="vb-item">
                    <div className="vb-num" style={{ color: 'var(--accent-green)' }}>3</div>
                    <div className="vb-label">{zh ? '买入' : 'Buy'}</div>
                  </div>
                  <div className="vb-item">
                    <div className="vb-num" style={{ color: '#eab308' }}>2</div>
                    <div className="vb-label">{zh ? '观察' : 'Hold'}</div>
                  </div>
                  <div className="vb-item">
                    <div className="vb-num" style={{ color: 'var(--accent-red)' }}>1</div>
                    <div className="vb-label">{zh ? '放弃' : 'Pass'}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: 4 }}>{zh ? '数据来源' : 'Data Sources'}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                    Apple 10-K FY2024, p.31-45<br />Q4 2024 Earnings Call Transcript
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="compare-section" id="compare">
        <div className="container">
          <div className="section-header fade-up">
            <div className="overline">{zh ? '竞品对比' : 'Comparison'}</div>
            <h2>{zh ? <>为什么选择 <span className="gold">BullSage</span>？</> : <>Why <span className="gold">BullSage</span>?</>}</h2>
          </div>
          <div className="compare-table-wrap fade-up">
            <table className="compare">
              <thead>
                <tr>
                  <th>{zh ? '功能' : 'Feature'}</th>
                  <th className="ours">BullSage 牛智</th>
                  <th>Seeking Alpha</th>
                  <th>Morningstar</th>
                  <th>{zh ? '同花顺' : '10jqka'}</th>
                  <th>invest-like</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feat: [zh ? '多大师框架裁决' : 'Multi-Master Verdicts'],
                    ours: <span className="yes">{zh ? '✓ 10位大师' : '✓ 10 Masters'}</span>,
                    sa: <span className="no">✗</span>,
                    ms: <span className="no">✗</span>,
                    tfq: <span className="no">✗</span>,
                    il: <span className="partial">{zh ? '△ 仅英文' : '△ EN only'}</span>,
                  },
                  {
                    feat: [zh ? '华尔街级报告' : 'Institutional Reports'],
                    ours: <span className="yes">{zh ? '✓ 完整DCF+评级' : '✓ Full DCF+Rating'}</span>,
                    sa: <span className="partial">△ $2,149/yr</span>,
                    ms: <span className="yes">✓</span>,
                    tfq: <span className="no">✗</span>,
                    il: <span className="no">✗</span>,
                  },
                  {
                    feat: [zh ? '可执行交易计划' : 'Actionable Trade Plans'],
                    ours: <span className="yes">{zh ? '✓ 进场/止损/仓位' : '✓ Entry/Stop/Size'}</span>,
                    sa: <span className="no">✗</span>,
                    ms: <span className="no">✗</span>,
                    tfq: <span className="no">✗</span>,
                    il: <span className="no">✗</span>,
                  },
                  {
                    feat: [zh ? '引用溯源（防幻觉）' : 'Citation Sourcing'],
                    ours: <span className="yes">{zh ? '✓ RAG架构' : '✓ RAG Architecture'}</span>,
                    sa: <span className="partial">{zh ? '△ 部分' : '△ Partial'}</span>,
                    ms: <span className="yes">✓</span>,
                    tfq: <span className="no">{zh ? '✗ 幻觉频出' : '✗ Hallucinations'}</span>,
                    il: <span className="no">✗</span>,
                  },
                  {
                    feat: [zh ? '中英双语' : 'Chinese + English'],
                    ours: <span className="yes">{zh ? '✓ 原生双语' : '✓ Native Bilingual'}</span>,
                    sa: <span className="no">{zh ? '✗ 仅英文' : '✗ EN only'}</span>,
                    ms: <span className="no">{zh ? '✗ 仅英文' : '✗ EN only'}</span>,
                    tfq: <span className="partial">{zh ? '△ 仅中文' : '△ CN only'}</span>,
                    il: <span className="no">{zh ? '✗ 仅英文' : '✗ EN only'}</span>,
                  },
                  {
                    feat: [zh ? '年费' : 'Annual Price'],
                    ours: <span className="yes">$179/yr</span>,
                    sa: '$299–$2,149',
                    ms: '$249',
                    tfq: '¥388–¥998',
                    il: '€180/yr',
                  },
                ].map((row, i) => (
                  <tr key={i}>
                    <td>{row.feat}</td>
                    <td className="ours">{row.ours}</td>
                    <td>{row.sa}</td>
                    <td>{row.ms}</td>
                    <td>{row.tfq}</td>
                    <td>{row.il}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="pricing-section" id="pricing">
        <div className="container">
          <div className="section-header fade-up">
            <div className="overline">{zh ? '定价方案' : 'Pricing'}</div>
            <h2>{zh ? <>选择适合你的 <span className="gold">投资伙伴</span></> : <>Choose Your <span className="gold">Investment Partner</span></>}</h2>
            <p>{zh ? '比 Seeking Alpha 便宜 40%，比 Morningstar 便宜 28%，功能更强大' : '40% cheaper than Seeking Alpha, 28% less than Morningstar, with more features'}</p>
          </div>
          <div className="pricing-grid">
            {/* Free */}
            <div className="price-card fade-up">
              <div className="price-name">{zh ? '免费版' : 'Free'}</div>
              <div className="price-amount"><span className="currency">$</span>0</div>
              <div className="price-desc">{zh ? '体验大师级分析' : 'Experience master-level analysis'}</div>
              <ul className="price-features">
                {(zh
                  ? ['每月 3 份完整报告', '5 维度基础评分', '10 只自选股跟踪', '每月 2 次大师快速判断', '教育内容全部开放']
                  : ['3 full reports/month', '5-dimension basic scores', '10-stock watchlist', '2 master quick verdicts/mo', 'Full educational content']
                ).map((f) => <li key={f}><span className="icon yes">✓</span>{f}</li>)}
              </ul>
              <Link to="/login" className="price-btn price-btn-outline">{zh ? '免费开始' : 'Start Free'}</Link>
            </div>

            {/* Single Report */}
            <div className="price-card fade-up delay-1">
              <div className="price-name">{zh ? '单报告' : 'Single Report'}</div>
              <div className="price-amount"><span className="currency">$</span>9<span className="unit"> /{zh ? '份' : 'report'}</span></div>
              <div className="price-desc">{zh ? '只分析一只股票？按需购买' : 'Just need one stock? Pay as you go'}</div>
              <ul className="price-features">
                {(zh
                  ? ['完整深度报告', '大师框架裁决 + DCF', '交易计划（进场/止损/仓位）', '30 天访问权', 'PDF 导出']
                  : ['Full deep analysis report', 'Master verdicts + DCF', 'Trade plan (entry/stop/size)', '30-day access', 'PDF export']
                ).map((f) => <li key={f}><span className="icon yes">✓</span>{f}</li>)}
              </ul>
              <Link to="/login" className="price-btn price-btn-outline">{zh ? '购买单份报告' : 'Buy Single Report'}</Link>
            </div>

            {/* Pro */}
            <div className="price-card featured fade-up delay-2">
              <div className="price-badge">{zh ? '最受欢迎' : 'Most Popular'}</div>
              <div className="price-name">Pro</div>
              <div className="price-amount"><span className="currency">$</span>19<span className="period"> /{zh ? '月' : 'mo'}</span></div>
              <div className="price-desc">{zh ? '或 $179/年（省 25%）' : 'or $179/year (save 25%)'}</div>
              <ul className="price-features">
                {(zh
                  ? ['无限报告生成', '多框架完整裁决', 'AI 对话（含引用溯源）', '组合 X-Ray 透视', '完整交易执行层', '无限自选股']
                  : ['Unlimited reports', 'Full multi-framework verdicts', 'AI chat with citations', 'Portfolio X-Ray', 'Full trade execution layer', 'Unlimited watchlist']
                ).map((f) => <li key={f}><span className="icon yes">✓</span>{f}</li>)}
              </ul>
              <Link to="/login" className="price-btn price-btn-gold">{zh ? '升级到 Pro' : 'Upgrade to Pro'}</Link>
              <div className="price-save">{zh ? '比 Seeking Alpha 便宜 40%' : '40% cheaper than Seeking Alpha'}</div>
            </div>

            {/* Lifetime */}
            <div className="price-card fade-up delay-3">
              <div className="price-name">{zh ? '创始会员终身版' : 'Founding Member'}</div>
              <div className="price-amount"><span className="currency">$</span>299</div>
              <div className="price-desc">{zh ? '一次付费，永久使用' : 'One-time payment, lifetime access'}</div>
              <ul className="price-features">
                {(zh
                  ? ['Pro 全部功能', '永久访问权', '优先体验新功能', '创始会员专属标识', '限量 500 名额']
                  : ['All Pro features', 'Lifetime access', 'Early access to new features', 'Founding member badge', 'Limited to 500 members']
                ).map((f) => <li key={f}><span className="icon yes">✓</span>{f}</li>)}
              </ul>
              <Link to="/login" className="price-btn price-btn-outline">{zh ? '锁定终身价格' : 'Lock Lifetime Price'}</Link>
              <div className="price-save">{zh ? '相当于不到 1.5 年 Pro 费用' : 'Less than 1.5 years of Pro'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="social-section">
        <div className="container">
          <div className="section-header fade-up">
            <div className="overline">{zh ? '用户反馈' : 'Testimonials'}</div>
            <h2>{zh ? '真实用户，真实评价' : 'Real Users, Real Reviews'}</h2>
            <p>{zh ? '来自新加坡、马来西亚、香港、澳大利亚的早期用户反馈' : 'Early user feedback from Singapore, Malaysia, Hong Kong, and Australia'}</p>
          </div>

          <div className="fade-up" style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap', marginBottom: 52 }}>
            {[
              { num: '4.9', sub: '★★★★★', label: zh ? '平均评分' : 'Average rating', subStyle: { color: '#eab308' } },
              { num: '500+', sub: null, label: zh ? '早期用户' : 'Early users' },
              { num: '6', sub: null, label: zh ? '覆盖地区' : 'Regions covered' },
              { num: '92%', sub: null, label: zh ? '愿意推荐' : 'Would recommend' },
            ].map((stat) => (
              <div key={stat.num} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--serif-en)', fontSize: '2.4rem', fontWeight: 800, color: 'var(--gold)' }}>{stat.num}</div>
                {stat.sub && <div style={{ fontSize: '0.95rem', letterSpacing: 2, ...stat.subStyle }}>{stat.sub}</div>}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: stat.sub ? 4 : 28 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="social-grid">
            {[
              {
                stars: '★★★★★', av: 'L', delay: '',
                textZh: '「用了同花顺的AI两年，不断被错误数据误导。BullSage 每个数字都能追溯到原文，终于有一个值得信赖的工具了。」',
                textEn: '"After 2 years of being misled by inaccurate AI data, BullSage traces every number to source documents. Finally a tool I can trust."',
                nameZh: '林先生', nameEn: 'Mr. Lin', roleZh: '新加坡 · 科技业投资者', roleEn: 'Singapore · Tech Investor',
              },
              {
                stars: '★★★★★', av: 'C', delay: 'delay-1',
                textZh: '「大师裁决引擎是杀手级功能。看到巴菲特和格雷厄姆对同一只股票持相反意见时，你才真正理解了投资的多维度性。」',
                textEn: '"The Master Verdict Engine is killer. When Buffett and Graham disagree on the same stock, you truly understand multi-dimensional investing."',
                nameZh: '陈女士', nameEn: 'Ms. Chen', roleZh: '吉隆坡 · 价值投资者', roleEn: 'Kuala Lumpur · Value Investor',
              },
              {
                stars: '★★★★★', av: 'W', delay: 'delay-2',
                textZh: '「终于不用在英文平台和中文平台之间来回切换了。报告里巴菲特的英文原话+中文翻译，这才是双语该有的样子。」',
                textEn: '"Finally no more switching between English and Chinese platforms. Original English quotes with Chinese translations — this is what bilingual should look like."',
                nameZh: '王先生', nameEn: 'Mr. Wang', roleZh: '悉尼 · 全球配置投资者', roleEn: 'Sydney · Global Allocation Investor',
              },
              {
                stars: '★★★★★', av: 'T', delay: 'delay-1',
                textZh: '「以前看美股报告要英文，看中文平台又缺深度。BullSage 直接帮我省掉了中间那层痛苦，60秒一份机构级报告。」',
                textEn: '"I used to struggle with English-only reports or shallow Chinese analysis. BullSage cut out that frustration — institutional-grade reports in 60 seconds."',
                nameZh: '张先生', nameEn: 'Mr. Zhang', roleZh: '香港 · 港美股投资者', roleEn: 'Hong Kong · HK & US Stock Investor',
              },
              {
                stars: '★★★★★', av: 'H', delay: 'delay-2',
                textZh: '「$9 一份报告是我今年最值的投资。分析 NVDA 的时候，格林布拉特的神奇公式直接告诉我估值过高，帮我避开了一个大坑。」',
                textEn: '"$9 per report is the best investment I made this year. The Greenblatt Magic Formula analysis on NVDA flagged the overvaluation — saved me from a big mistake."',
                nameZh: '黄女士', nameEn: 'Ms. Huang', roleZh: '台北 · 个人投资者', roleEn: 'Taipei · Individual Investor',
              },
              {
                stars: '★★★★☆', av: 'A', delay: 'delay-3',
                textZh: '「作为价值投资初学者，格雷厄姆和巴菲特框架的中文解释让我真正入门了。希望以后能加入更多港股数据。」',
                textEn: '"As a value investing beginner, the Chinese-language Buffett and Graham frameworks finally made things click. Would love more HK stock coverage."',
                nameZh: 'Amir S.', nameEn: 'Amir S.', roleZh: '吉隆坡 · 投资新手', roleEn: 'Kuala Lumpur · Investing Beginner',
              },
            ].map((t) => (
              <div key={t.av + t.delay} className={`social-card fade-up ${t.delay}`}>
                <div className="social-stars">{t.stars}</div>
                <p className="social-text">{zh ? t.textZh : t.textEn}</p>
                <div className="social-author">
                  <div className="social-av">{t.av}</div>
                  <div className="social-info">
                    <div className="name">{zh ? t.nameZh : t.nameEn}</div>
                    <div className="role">{zh ? t.roleZh : t.roleEn}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="fade-up" style={{ textAlign: 'center', marginTop: 48 }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: 14 }}>
              {zh ? '你也有想法？帮助我们把 BullSage 做得更好。' : 'Have thoughts? Help us make BullSage better.'}
            </p>
            <Link
              to="/feedback"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--gold)', padding: '10px 24px', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}
            >
              💬 {zh ? '提交反馈' : 'Submit Feedback'}
            </Link>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="cta-section">
        <div className="container">
          <h2 className="fade-up">
            {zh ? <>60秒，用大师眼光<br />看透一只股票</> : <>60 Seconds to See<br />Through Masters' Eyes</>}
          </h2>
          <p className="fade-up">
            {zh
              ? '输入任意股票代码，获得巴菲特、格雷厄姆、林奇等10位大师的独立裁决。每月3次免费，无需信用卡。'
              : 'Enter any ticker for independent verdicts from Buffett, Graham, Lynch and 7 more masters. 3 free reports/month, no credit card required.'}
          </p>
          <div className="cta-buttons fade-up">
            <Link to="/login" className="btn-lg btn-gold">{zh ? '免费开始分析' : 'Start Free Analysis'}</Link>
            <a href="#verdict" className="btn-lg btn-outline">{zh ? '查看演示' : 'See Demo'}</a>
          </div>
          <p className="cta-disclaimer">
            {zh
              ? '本平台提供的所有分析内容均为教育性质，不构成投资建议。投资有风险，入市需谨慎。'
              : 'All analysis provided is educational in nature and does not constitute investment advice. Investing involves risk.'}
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--gold)', fontFamily: 'var(--serif-en)', fontSize: '1.3rem', fontWeight: 700, marginBottom: 12 }}>
                <span style={{ width: 32, height: 32, background: 'linear-gradient(135deg,var(--gold),var(--gold-dim))', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--navy)', fontWeight: 900 }}>B</span>
                BullSage
              </Link>
              <p>
                {zh
                  ? '牛智 — 用大师的眼光看每一只股票。全球首个中英双语 AI 投资裁决引擎。'
                  : "See every stock through masters' eyes. The world's first bilingual AI investment verdict engine."}
              </p>
            </div>
            <div className="footer-col">
              <h4>{zh ? '产品' : 'Product'}</h4>
              <a href="#skills">{zh ? '四大能力' : 'Features'}</a>
              <a href="#verdict">{zh ? '大师裁决' : 'Verdicts'}</a>
              <a href="#pricing">{zh ? '定价方案' : 'Pricing'}</a>
              <a href="#">{zh ? 'API 接口' : 'API'}</a>
            </div>
            <div className="footer-col">
              <h4>{zh ? '资源' : 'Resources'}</h4>
              <a href="#">{zh ? '大师框架指南' : 'Framework Guide'}</a>
              <a href="#">{zh ? '投资教育' : 'Education'}</a>
              <a href="#">{zh ? '帮助中心' : 'Help Center'}</a>
              <a href="#">{zh ? '博客' : 'Blog'}</a>
            </div>
            <div className="footer-col">
              <h4>{zh ? '公司' : 'Company'}</h4>
              <a href="#">{zh ? '关于我们' : 'About'}</a>
              <a href="mailto:legal@bullsage.co">{zh ? '联系我们' : 'Contact'}</a>
              <a href="#">{zh ? '合规声明' : 'Compliance'}</a>
              <a href="#">Twitter / X</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 BullSage. {zh ? '保留所有权利。' : 'All rights reserved.'}</span>
            <div className="footer-legal">
              <a href="#">{zh ? '隐私政策' : 'Privacy'}</a>
              <a href="#">{zh ? '服务条款' : 'Terms'}</a>
              <a href="#">{zh ? '免责声明' : 'Disclaimer'}</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
