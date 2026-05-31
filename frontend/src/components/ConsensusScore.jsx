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
