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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">{report.company_name}</h1>
          <span className="font-mono text-gray-500">{report.ticker} · {report.exchange} · {report.currency} {report.price}</span>
        </div>
        <div className="text-right text-xs text-gray-500">
          {new Date(report.generated_at).toLocaleDateString()}
        </div>
      </div>

      <div className="mb-8">
        <ConsensusScore consensus={report.consensus} lang={lang} />
      </div>

      <h2 className="text-xl font-serif font-bold text-white mb-4">大师裁决</h2>
      <div className="mb-10">
        <VerdictGrid verdicts={report.master_verdicts} lang={lang} />
      </div>

      <h2 className="text-xl font-serif font-bold text-white mb-4">华尔街深度报告</h2>
      <div className="mb-10">
        <WallStreetReport report={report.wall_street_report} lang={lang} />
      </div>

      <h2 className="text-xl font-serif font-bold text-white mb-4">交易计划</h2>
      <TradePlan plan={report.trade_plan} lang={lang} />

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
