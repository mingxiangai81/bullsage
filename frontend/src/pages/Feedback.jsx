import { useState } from 'react';
import api from '../services/api';

const CATEGORIES_ZH = ['功能建议', '数据准确性', 'AI 分析质量', '界面体验', '定价', '其他'];
const CATEGORIES_EN = ['Feature Request', 'Data Accuracy', 'AI Analysis Quality', 'UI/UX', 'Pricing', 'Other'];

const RATINGS = [
  { value: 5, emoji: '🤩', zh: '非常满意', en: 'Love it' },
  { value: 4, emoji: '😊', zh: '满意',     en: 'Like it'  },
  { value: 3, emoji: '😐', zh: '一般',     en: 'It\'s ok'  },
  { value: 2, emoji: '😕', zh: '不满意',   en: 'Dislike'  },
  { value: 1, emoji: '😤', zh: '很差',     en: 'Hate it'  },
];

export default function Feedback() {
  const lang = localStorage.getItem('lang') || 'zh';

  const [rating, setRating]       = useState(null);
  const [category, setCategory]   = useState('');
  const [message, setMessage]     = useState('');
  const [email, setEmail]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const categories = lang === 'zh' ? CATEGORIES_ZH : CATEGORIES_EN;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !message.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/api/feedback', {
        rating,
        category,
        message: message.trim(),
        email: email.trim() || null,
        language: lang,
      });
      setSubmitted(true);
    } catch {
      setError(lang === 'zh' ? '提交失败，请稍后重试。' : 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-3">
            {lang === 'zh' ? '感谢你的反馈！' : 'Thank you for your feedback!'}
          </h2>
          <p className="text-gray-400 mb-8">
            {lang === 'zh'
              ? '你的意见对我们非常重要，我们会认真阅读每一条反馈。'
              : "Your feedback means a lot to us. We read every single response."}
          </p>
          <button
            onClick={() => { setSubmitted(false); setRating(null); setCategory(''); setMessage(''); setEmail(''); }}
            className="bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dim)] text-[var(--navy)] px-6 py-3 rounded-xl font-bold"
          >
            {lang === 'zh' ? '再提交一条' : 'Submit another'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">💬</div>
          <h1 className="text-3xl font-bold text-white mb-3">
            {lang === 'zh' ? '告诉我们你的想法' : 'Share Your Thoughts'}
          </h1>
          <p className="text-gray-400">
            {lang === 'zh'
              ? 'BullSage 正在快速成长，你的每一条反馈都会直接影响我们的开发方向。'
              : 'BullSage is growing fast. Every piece of feedback directly shapes what we build next.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Rating */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <p className="text-white font-semibold mb-4">
              {lang === 'zh' ? '你对 BullSage 的整体评价？' : 'How would you rate BullSage overall?'}
            </p>
            <div className="flex gap-3 flex-wrap">
              {RATINGS.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRating(r.value)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition ${
                    rating === r.value
                      ? 'border-[var(--gold)] bg-[var(--gold)]/10'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="text-xs text-gray-400">{lang === 'zh' ? r.zh : r.en}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <p className="text-white font-semibold mb-4">
              {lang === 'zh' ? '反馈类型（选填）' : 'Feedback category (optional)'}
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCategory(cat === category ? '' : cat)}
                  className={`px-4 py-2 rounded-full text-sm border transition ${
                    category === cat
                      ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]'
                      : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <label className="text-white font-semibold mb-3 block">
              {lang === 'zh' ? '你的具体反馈 *' : 'Your feedback *'}
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              rows={5}
              placeholder={lang === 'zh'
                ? '你喜欢什么？有什么不满意？希望我们增加什么功能？'
                : 'What do you love? What frustrates you? What feature would you add?'}
              className="w-full bg-[var(--navy)] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[var(--gold)] transition resize-none placeholder:text-gray-600"
            />
            <p className="text-xs text-gray-600 mt-2">{message.length}/1000</p>
          </div>

          {/* Email */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <label className="text-white font-semibold mb-3 block">
              {lang === 'zh' ? '联系邮箱（选填，如需回复）' : 'Email (optional, if you want a reply)'}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={lang === 'zh' ? 'your@email.com' : 'your@email.com'}
              className="w-full bg-[var(--navy)] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[var(--gold)] transition"
            />
            <p className="text-xs text-gray-600 mt-2">
              {lang === 'zh'
                ? '我们不会将你的邮箱用于任何营销目的。'
                : 'We will never use your email for marketing purposes.'}
            </p>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={!rating || !message.trim() || loading}
            className="w-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dim)] text-[var(--navy)] py-4 rounded-xl font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition hover:shadow-lg hover:shadow-[var(--gold)]/20"
          >
            {loading
              ? (lang === 'zh' ? '提交中...' : 'Submitting...')
              : (lang === 'zh' ? '提交反馈' : 'Submit Feedback')}
          </button>

          <p className="text-center text-xs text-gray-600">
            {lang === 'zh'
              ? '每条反馈都会由创始团队亲自阅读。'
              : 'Every response is personally read by the founding team.'}
          </p>
        </form>

        {/* Featured testimonials at bottom */}
        <div className="mt-16">
          <p className="text-center text-sm text-gray-500 mb-6">
            {lang === 'zh' ? '来自其他用户的评价' : 'What other users say'}
          </p>
          <div className="space-y-4">
            {[
              {
                zh: '「大师裁决引擎是杀手级功能。巴菲特和格雷厄姆对同一只股票持相反意见，这让我真正理解了投资的多维度性。」',
                en: '"The Master Verdict Engine is genius. Seeing Buffett and Graham disagree on the same stock finally made me understand multi-dimensional investing."',
                nameZh: '陈女士 · 吉隆坡', nameEn: 'Ms. Chen · Kuala Lumpur', av: 'C',
              },
              {
                zh: '「每个数字都有来源引用，第一次用AI投资工具不用担心数据是编造的。」',
                en: '"Every number has a citation. For the first time I\'m using an AI investing tool without worrying the data is made up."',
                nameZh: '林先生 · 新加坡', nameEn: 'Mr. Lin · Singapore', av: 'L',
              },
            ].map((t, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex gap-4">
                <div className="w-9 h-9 rounded-full bg-[var(--gold)]/15 text-[var(--gold)] flex items-center justify-center text-sm font-bold flex-shrink-0">{t.av}</div>
                <div>
                  <p className="text-sm text-gray-400 italic mb-2">{lang === 'zh' ? t.zh : t.en}</p>
                  <p className="text-xs text-gray-600">{lang === 'zh' ? t.nameZh : t.nameEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
