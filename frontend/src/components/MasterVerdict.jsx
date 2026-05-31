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
