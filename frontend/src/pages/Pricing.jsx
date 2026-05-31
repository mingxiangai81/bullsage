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
        <h1 className="text-3xl font-bold text-white mb-3">选择你的投资伙伴</h1>
        <p className="text-gray-400">比 Seeking Alpha 便宜 40%，功能更强大</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map(plan => (
          <div key={plan.id} className={`rounded-2xl p-7 text-center relative transition hover:-translate-y-1 ${plan.featured ? 'bg-white/[0.04] border-2 border-[var(--gold)] shadow-lg shadow-[var(--gold)]/5 scale-[1.02]' : 'bg-white/[0.02] border border-white/10'}`}>
            {plan.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dim)] text-[var(--navy)] px-4 py-1 rounded-full text-xs font-bold">最受欢迎</div>}
            <h3 className="text-white font-bold text-lg mt-2">{plan.name}</h3>
            <div className="text-3xl font-black text-white my-2">{plan.price}<span className="text-sm text-gray-500 font-normal">{plan.period}</span></div>
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
