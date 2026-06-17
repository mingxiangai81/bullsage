import { useState } from 'react';
import { Link } from 'react-router-dom';
import useLang from '../hooks/useLang';

export default function Pricing() {
  const [lang] = useLang();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const zh = lang === 'zh';

  const plans = [
    {
      id: 'free',
      name: zh ? '免费版' : 'Free',
      price: '$0',
      period: '',
      desc: zh ? '体验大师级分析' : 'Experience master analysis',
      features: zh
        ? ['每月 3 份报告', '5 维度评分', '10 只自选股', '2 次大师判断/月', '教育内容全开放']
        : ['3 full reports/month', '5-dimension scores', '10-stock watchlist', '2 master verdicts/mo', 'Full educational content'],
      btn: zh ? '免费开始' : 'Start Free',
      outline: true,
    },
    {
      id: 'single_report',
      name: zh ? '单报告' : 'Single Report',
      price: '$9',
      period: zh ? '/份' : '/report',
      desc: zh ? '按需购买' : 'Pay as you go',
      features: zh
        ? ['完整深度报告', '大师裁决 + DCF', '交易计划', '30 天访问', 'PDF 导出']
        : ['Full analysis report', 'Master verdicts + DCF', 'Trade plan', '30-day access', 'PDF export'],
      btn: zh ? '购买报告' : 'Purchase',
      outline: true,
    },
    {
      id: 'pro_monthly',
      name: 'Pro',
      price: '$19',
      period: zh ? '/月' : '/mo',
      desc: zh ? '$179/年（省 25%）' : '$179/year (save 25%)',
      features: zh
        ? ['无限报告生成', '多框架完整裁决', 'AI 对话（含引用溯源）', '组合 X-Ray 透视', '完整交易执行层', '无限自选股']
        : ['Unlimited reports', 'Full multi-framework verdicts', 'AI chat with citations', 'Portfolio X-Ray', 'Full trade execution', 'Unlimited watchlist'],
      btn: zh ? '升级到 Pro' : 'Upgrade to Pro',
      featured: true,
    },
    {
      id: 'lifetime',
      name: zh ? '创始终身版' : 'Founding Member',
      price: '$299',
      period: '',
      desc: zh ? '一次付费，永久使用' : 'One-time, lifetime access',
      features: zh
        ? ['Pro 全部功能', '永久访问权', '优先体验新功能', '创始会员专属标识', '限量 500 名额']
        : ['All Pro features', 'Lifetime access', 'Early access to features', 'Founding member badge', 'Limited to 500'],
      btn: zh ? '锁定终身价格' : 'Lock Lifetime Price',
      outline: true,
    },
  ];

  const handleCheckout = () => {
    const token = localStorage.getItem('access_token');
    if (!token) { window.location.href = '/login'; return; }
    setShowComingSoon(true);
  };

  return (
    <div className="pt-24 pb-16 max-w-5xl mx-auto px-6">

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => setShowComingSoon(false)}
        >
          <div
            className="bg-[var(--navy-light)] border border-[var(--gold)]/20 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {zh ? '支付功能即将上线' : 'Payment Coming Soon'}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {zh
                ? '我们正在接入 Stripe 支付系统。如需提前升级，请通过邮件联系我们。'
                : "We're integrating Stripe payments. Email us to upgrade early."}
            </p>
            <a
              href="mailto:hello@bullsage.co"
              className="inline-block bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dim)] text-[var(--navy)] px-6 py-2.5 rounded-xl font-bold text-sm"
            >
              hello@bullsage.co
            </a>
            <button
              onClick={() => setShowComingSoon(false)}
              className="block w-full text-sm text-gray-500 hover:text-gray-300 mt-4"
            >
              {zh ? '关闭' : 'Close'}
            </button>
          </div>
        </div>
      )}

      <div className="text-center mb-12">
        <p className="text-xs text-[var(--gold)] uppercase tracking-widest font-semibold mb-3">
          {zh ? '定价方案' : 'Pricing'}
        </p>
        <h1 className="text-3xl font-bold text-white mb-3">
          {zh ? '选择你的投资伙伴' : 'Choose Your Investment Partner'}
        </h1>
        <p className="text-gray-400">
          {zh
            ? '比 Seeking Alpha 便宜 40%，比 Morningstar 便宜 28%，功能更强大'
            : '40% cheaper than Seeking Alpha, 28% less than Morningstar, more features'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`rounded-2xl p-7 text-center relative transition hover:-translate-y-1 ${
              plan.featured
                ? 'bg-white/[0.04] border-2 border-[var(--gold)] shadow-lg shadow-[var(--gold)]/5 scale-[1.02]'
                : 'bg-white/[0.02] border border-white/10'
            }`}
          >
            {plan.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dim)] text-[var(--navy)] px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                {zh ? '最受欢迎' : 'Most Popular'}
              </div>
            )}
            <h3 className="text-white font-bold text-lg mt-2">{plan.name}</h3>
            <div className="text-3xl font-black text-white my-2">
              {plan.price}
              <span className="text-sm text-gray-500 font-normal">{plan.period}</span>
            </div>
            <p className="text-xs text-gray-500 mb-5">{plan.desc}</p>
            <ul className="text-left space-y-2 mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>{f}
                </li>
              ))}
            </ul>
            {plan.id === 'free' ? (
              <Link
                to="/login"
                className="block w-full py-3 rounded-xl font-bold text-sm transition bg-transparent border border-white/10 text-white hover:border-[var(--gold)] hover:text-[var(--gold)]"
              >
                {plan.btn}
              </Link>
            ) : (
              <button
                onClick={handleCheckout}
                className={`w-full py-3 rounded-xl font-bold text-sm transition ${
                  plan.featured
                    ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dim)] text-[var(--navy)] hover:shadow-lg hover:shadow-[var(--gold)]/20'
                    : 'bg-transparent border border-white/10 text-white hover:border-[var(--gold)] hover:text-[var(--gold)]'
                }`}
              >
                {plan.btn}
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-600 mt-8">
        {zh
          ? '所有付费方案均包含 7 天退款保证。教育性内容，非投资建议。'
          : 'All paid plans include a 7-day money-back guarantee. Educational content, not investment advice.'}
      </p>
    </div>
  );
}
