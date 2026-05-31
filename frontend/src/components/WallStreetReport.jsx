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
