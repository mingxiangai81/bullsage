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
