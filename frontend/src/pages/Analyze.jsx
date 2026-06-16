import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { analyzeStock } from '../services/api';
import VerdictGrid from '../components/VerdictGrid';
import ConsensusScore from '../components/ConsensusScore';
import WallStreetReport from '../components/WallStreetReport';
import TradePlan from '../components/TradePlan';
import TrialBanner from '../components/TrialBanner';
import useLang from '../hooks/useLang';

export default function Analyze() {
  const { ticker } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lang] = useLang();
  const zh = lang === 'zh';

  useEffect(() => {
    setLoading(true);
    setError(null);
    setReport(null);
    analyzeStock(ticker, lang)
      .then((res) => setReport(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Analysis failed'))
      .finally(() => setLoading(false));
  }, [ticker, lang]);

  if (loading) {
    return (
      <div className="pt-24 text-center px-6">
        <div className="text-[var(--gold)] text-xl font-semibold mb-4">
          {zh ? `正在分析 ${ticker.toUpperCase()}…` : `Analyzing ${ticker.toUpperCase()}…`}
        </div>
        <div className="text-gray-500">
          {zh
            ? '10位大师正在独立裁决，预计需要 30–60 秒'
            : '10 masters are deliberating independently — this takes 30–60 seconds'}
        </div>
        <div className="mt-8 w-12 h-12 border-4 border-[var(--gold)]/30 border-t-[var(--gold)] rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error && (error.includes('TRIAL_LIMIT') || error.includes('TRIAL_EXPIRED'))) {
    const isExpired = error.includes('TRIAL_EXPIRED');
    return (
      <div className="pt-24 max-w-md mx-auto px-6 text-center">
        <div className="text-5xl mb-4">{isExpired ? '⏰' : '🔒'}</div>
        <h2 className="text-2xl font-bold text-white mb-3">
          {isExpired
            ? (zh ? '免费体验已到期' : 'Free Trial Expired')
            : (zh ? '免费次数已用完' : 'Free Queries Used Up')}
        </h2>
        <p className="text-gray-400 mb-6">
          {isExpired
            ? (zh ? '你的 7 天免费体验已结束，升级到 Pro 继续使用无限查询。' : 'Your 7-day free trial has ended. Upgrade to Pro for unlimited reports.')
            : (zh ? '你已使用完 3 次免费查询，升级到 Pro 解锁无限报告。' : "You've used all 3 free queries. Upgrade to Pro for unlimited reports.")}
        </p>
        <Link
          to="/pricing"
          className="inline-block bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dim)] text-[var(--navy)] px-8 py-3 rounded-xl font-bold"
        >
          {zh ? '查看升级方案 →' : 'View Upgrade Plans →'}
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 text-center px-6">
        <div className="text-red-400 mb-4">{error}</div>
        <Link to="/" className="text-[var(--gold)] text-sm hover:underline">
          {zh ? '← 返回首页' : '← Back to Home'}
        </Link>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="pt-20 pb-16 max-w-6xl mx-auto px-6">
      <TrialBanner />
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">{report.company_name}</h1>
          <span className="font-mono text-gray-500">
            {report.ticker} · {report.exchange} · {report.currency} {report.price}
          </span>
        </div>
        <div className="text-right text-xs text-gray-500">
          {new Date(report.generated_at).toLocaleDateString(zh ? 'zh-CN' : 'en-US')}
        </div>
      </div>

      <div className="mb-8">
        <ConsensusScore consensus={report.consensus} lang={lang} />
      </div>

      <h2 className="text-xl font-bold text-white mb-4">{zh ? '大师裁决' : 'Master Verdicts'}</h2>
      <div className="mb-10">
        <VerdictGrid verdicts={report.master_verdicts} lang={lang} />
      </div>

      <h2 className="text-xl font-bold text-white mb-4">{zh ? '华尔街深度报告' : 'Wall Street Report'}</h2>
      <div className="mb-10">
        <WallStreetReport report={report.wall_street_report} lang={lang} />
      </div>

      <h2 className="text-xl font-bold text-white mb-4">{zh ? '交易计划' : 'Trade Plan'}</h2>
      <TradePlan plan={report.trade_plan} lang={lang} />

      <div className="mt-10 text-xs text-gray-600">
        <p className="mb-1 font-semibold">{zh ? '数据来源：' : 'Data Sources:'}</p>
        {report.data_sources?.map((s, i) => (
          <span key={i} className="mr-4">{s.label} ({s.field})</span>
        ))}
        <p className="mt-4">
          {zh
            ? '本平台提供的所有分析内容均为教育性质，不构成投资建议。投资有风险，入市需谨慎。'
            : 'All analysis is educational in nature and does not constitute investment advice. Investing involves risk.'}
        </p>
      </div>
    </div>
  );
}
