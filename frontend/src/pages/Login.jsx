import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const COUNTRIES = [
  'Singapore', 'Malaysia', 'Hong Kong', 'Taiwan', 'Australia',
  'Canada', 'United States', 'United Kingdom', 'New Zealand',
  'Japan', 'South Korea', 'Indonesia', 'Thailand', 'Philippines',
  'China (Mainland)', 'Other',
];

const INPUT = "w-full bg-[var(--navy)] border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[var(--gold)] transition";

export default function Login() {
  const lang = localStorage.getItem('lang') || 'zh';
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Login fields
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  // Register extra fields
  const [fullName, setFullName] = useState('');
  const [country,  setCountry]  = useState('');
  const [dob,      setDob]      = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Age validation (must be 18+)
    if (isRegister) {
      const birthDate = new Date(dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        setError(lang === 'zh' ? '必须年满 18 岁才能注册。' : 'You must be at least 18 years old to register.');
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload  = isRegister
        ? { email, password, full_name: fullName, country, date_of_birth: dob }
        : { email, password };

      const res = await api.post(endpoint, payload, { validateStatus: (s) => s < 500 });

      // 202 = email confirmation required
      if (res.status === 202 || res.data?.email_confirmation_required || res.data?.detail === 'CHECK_EMAIL') {
        setError(
          lang === 'zh'
            ? '✅ 注册成功！请检查邮箱 ' + email + ' 并点击确认链接，然后再登录。'
            : '✅ Registered! Please check ' + email + ' and click the confirmation link, then log in.'
        );
        setLoading(false);
        return;
      }

      if (res.status >= 400) {
        const detail = res.data?.detail || '';
        if (detail.includes('already registered') || detail.includes('already exists') || detail.includes('Email already registered')) {
          setError(lang === 'zh' ? '该邮箱已注册，请直接登录。' : 'Email already registered. Please log in.');
        } else if (detail.includes('Invalid login') || detail.includes('Invalid email or password')) {
          setError(lang === 'zh' ? '邮箱或密码错误。' : 'Invalid email or password.');
        } else if (detail.includes('Email not confirmed')) {
          setError(lang === 'zh' ? '请先确认邮箱，检查你的收件箱。' : 'Please confirm your email first. Check your inbox.');
        } else {
          setError(detail || (lang === 'zh' ? '操作失败，请重试。' : 'Failed. Please try again.'));
        }
        setLoading(false);
        return;
      }

      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('user_email',   res.data.email);
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || '';
      setError(detail || (lang === 'zh' ? '网络错误，请重试。' : 'Network error. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className={`w-full bg-[var(--navy-light)] border border-[var(--gold)]/15 rounded-2xl p-8 shadow-xl ${isRegister ? 'max-w-md' : 'max-w-sm'}`}>

        {/* Trial badge */}
        {isRegister && (
          <div className="flex items-center justify-center gap-2 bg-[var(--gold)]/10 border border-[var(--gold)]/20 rounded-xl px-4 py-2 mb-6">
            <span className="text-lg">🎁</span>
            <span className="text-sm text-[var(--gold)] font-semibold">
              {lang === 'zh' ? '7天免费体验 · 3次完整查询' : '7-Day Free Trial · 3 Full Analyses'}
            </span>
          </div>
        )}

        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {isRegister
            ? (lang === 'zh' ? '创建免费账户' : 'Create Free Account')
            : (lang === 'zh' ? '登录' : 'Log In')}
        </h2>
        {isRegister && (
          <p className="text-center text-xs text-gray-500 mb-6">
            {lang === 'zh'
              ? '注册后即可获得 7 天免费体验，无需信用卡'
              : 'Get 7 days free access — no credit card required'}
          </p>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── REGISTER EXTRA FIELDS ── */}
          {isRegister && (
            <>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  {lang === 'zh' ? '全名 *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder={lang === 'zh' ? '请输入你的全名' : 'Enter your full name'}
                  required
                  className={INPUT}
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  {lang === 'zh' ? '国家 / 地区 *' : 'Country / Region *'}
                </label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  required
                  className={INPUT + ' appearance-none cursor-pointer'}
                >
                  <option value="">{lang === 'zh' ? '请选择国家...' : 'Select country...'}</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  {lang === 'zh' ? '出生日期 * (必须年满 18 岁)' : 'Date of Birth * (must be 18+)'}
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  required
                  className={INPUT + ' cursor-pointer'}
                />
              </div>

              <div className="border-t border-white/5 pt-2" />
            </>
          )}

          {/* ── COMMON FIELDS ── */}
          <div>
            {isRegister && <label className="text-xs text-gray-500 mb-1 block">{lang === 'zh' ? '电子邮件 *' : 'Email *'}</label>}
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={lang === 'zh' ? '电子邮件' : 'Email'}
              required
              className={INPUT}
            />
          </div>

          <div>
            {isRegister && <label className="text-xs text-gray-500 mb-1 block">{lang === 'zh' ? '密码 * (最少 6 位)' : 'Password * (min 6 chars)'}</label>}
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={lang === 'zh' ? '密码' : 'Password'}
              required
              minLength={6}
              className={INPUT}
            />
          </div>

          {/* Legal consent for registration */}
          {isRegister && (
            <p className="text-xs text-gray-600 leading-relaxed">
              {lang === 'zh'
                ? '注册即表示你同意我们的'
                : 'By registering, you agree to our '}
              <a href="/legal/terms" className="text-[var(--gold)] hover:underline" target="_blank">
                {lang === 'zh' ? '服务条款' : 'Terms of Service'}
              </a>
              {lang === 'zh' ? '和' : ' and '}
              <a href="/legal/privacy" className="text-[var(--gold)] hover:underline" target="_blank">
                {lang === 'zh' ? '隐私政策' : 'Privacy Policy'}
              </a>
              {lang === 'zh' ? '。所有内容为教育性质，非投资建议。' : '. All content is educational, not investment advice.'}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dim)] text-[var(--navy)] rounded-xl py-3 font-bold text-base disabled:opacity-50 transition hover:shadow-lg hover:shadow-[var(--gold)]/20"
          >
            {loading
              ? (lang === 'zh' ? '处理中...' : 'Processing...')
              : isRegister
                ? (lang === 'zh' ? '🎁 开始 7 天免费体验' : '🎁 Start 7-Day Free Trial')
                : (lang === 'zh' ? '登录' : 'Log In')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          {isRegister
            ? (lang === 'zh' ? '已有账户？' : 'Already have an account? ')
            : (lang === 'zh' ? '还没有账户？' : "Don't have an account? ")}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-[var(--gold)] ml-1 font-semibold hover:underline"
          >
            {isRegister
              ? (lang === 'zh' ? '直接登录' : 'Log in')
              : (lang === 'zh' ? '免费注册' : 'Register free')}
          </button>
        </p>
      </div>
    </div>
  );
}
