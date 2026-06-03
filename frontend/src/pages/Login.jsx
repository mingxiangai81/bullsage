import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const COUNTRIES = [
  'Singapore', 'Malaysia', 'Hong Kong', 'Taiwan', 'Australia',
  'Canada', 'United States', 'United Kingdom', 'New Zealand',
  'Japan', 'South Korea', 'Indonesia', 'Thailand', 'Philippines',
  'China (Mainland)', 'Other',
];

const INPUT = "w-full bg-[var(--navy)] border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[var(--gold)] transition placeholder:text-gray-600";

export default function Login() {
  const lang = localStorage.getItem('lang') || 'zh';
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [emailSent, setEmailSent]   = useState(''); // holds email if confirmation sent
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [country,  setCountry]  = useState('');
  const [dob,      setDob]      = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isRegister) {
      const age = new Date().getFullYear() - new Date(dob).getFullYear();
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

      // validateStatus so 202/4xx don't throw
      const res = await api.post(endpoint, payload, { validateStatus: s => s < 500 });

      // ── Email confirmation required ──────────────────────────────────────
      if (res.status === 202 || res.data?.email_confirmation_required) {
        setEmailSent(email);
        setLoading(false);
        return;
      }

      // ── Client error ─────────────────────────────────────────────────────
      if (res.status >= 400) {
        const d = res.data?.detail || '';
        if (d.includes('already registered') || d.includes('already exists') || d.includes('Email already registered')) {
          setError(lang === 'zh' ? '该邮箱已注册，请直接登录。' : 'Email already registered — please log in.');
        } else if (d.includes('Invalid login') || d.includes('Invalid email or password')) {
          setError(lang === 'zh' ? '邮箱或密码错误，请重试。' : 'Wrong email or password.');
        } else if (d.includes('Email not confirmed')) {
          setEmailSent(email);
        } else {
          setError(d || (lang === 'zh' ? '操作失败，请重试。' : 'Something went wrong. Please try again.'));
        }
        setLoading(false);
        return;
      }

      // ── Success ───────────────────────────────────────────────────────────
      localStorage.setItem('access_token', res.data.access_token || '');
      localStorage.setItem('user_email',   res.data.email || '');
      navigate('/dashboard');

    } catch (err) {
      setError(lang === 'zh' ? '网络错误，请检查连接后重试。' : 'Network error. Please check your connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  // ── Email confirmation waiting screen ─────────────────────────────────────
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-[var(--navy-light)] border border-[var(--gold)]/15 rounded-2xl p-10 text-center shadow-xl">
          <div className="text-6xl mb-5">📬</div>
          <h2 className="text-2xl font-bold text-white mb-3">
            {lang === 'zh' ? '注册成功！请确认邮箱' : 'Almost there!'}
          </h2>
          <p className="text-gray-400 mb-2">
            {lang === 'zh'
              ? `确认邮件已发送到：`
              : `We sent a confirmation link to:`}
          </p>
          <p className="text-[var(--gold)] font-semibold mb-6 break-all">{emailSent}</p>
          <p className="text-sm text-gray-500 mb-8">
            {lang === 'zh'
              ? '请点击邮件中的链接完成注册，然后回来登录。邮件可能需要 1-2 分钟，也请检查垃圾邮件。'
              : 'Click the link in the email to verify your account, then come back to log in. Check spam if you don\'t see it.'}
          </p>
          <button
            onClick={() => { setEmailSent(''); setIsRegister(false); setError(''); }}
            className="w-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dim)] text-[var(--navy)] rounded-xl py-3 font-bold mb-3"
          >
            {lang === 'zh' ? '我已确认，去登录 →' : 'I confirmed — go to login →'}
          </button>
          <button
            onClick={() => setEmailSent('')}
            className="text-sm text-gray-500 hover:text-gray-300"
          >
            {lang === 'zh' ? '重新注册' : 'Start over'}
          </button>
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className={`w-full bg-[var(--navy-light)] border border-[var(--gold)]/15 rounded-2xl p-8 shadow-xl ${isRegister ? 'max-w-md' : 'max-w-sm'}`}>

        {isRegister && (
          <div className="flex items-center justify-center gap-2 bg-[var(--gold)]/10 border border-[var(--gold)]/20 rounded-xl px-4 py-2 mb-6">
            <span className="text-lg">🎁</span>
            <span className="text-sm text-[var(--gold)] font-semibold">
              {lang === 'zh' ? '7天免费体验 · 3次完整查询' : '7-Day Free Trial · 3 Full Analyses'}
            </span>
          </div>
        )}

        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {isRegister ? (lang === 'zh' ? '创建免费账户' : 'Create Free Account') : (lang === 'zh' ? '登录' : 'Log In')}
        </h2>
        {isRegister && (
          <p className="text-center text-xs text-gray-500 mb-5">
            {lang === 'zh' ? '无需信用卡，30秒完成注册' : 'No credit card required · 30-second signup'}
          </p>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{lang === 'zh' ? '全名 *' : 'Full Name *'}</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder={lang === 'zh' ? '请输入你的全名' : 'Your full name'} required className={INPUT} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{lang === 'zh' ? '国家 / 地区 *' : 'Country *'}</label>
                <select value={country} onChange={e => setCountry(e.target.value)} required className={INPUT + ' appearance-none cursor-pointer'}>
                  <option value="">{lang === 'zh' ? '请选择...' : 'Select country...'}</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{lang === 'zh' ? '出生日期 * (须年满 18 岁)' : 'Date of Birth * (18+)'}</label>
                <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                  max={new Date(new Date().setFullYear(new Date().getFullYear()-18)).toISOString().split('T')[0]}
                  required className={INPUT + ' cursor-pointer'} />
              </div>
              <div className="border-t border-white/5" />
            </>
          )}

          <div>
            {isRegister && <label className="text-xs text-gray-500 mb-1 block">{lang === 'zh' ? '电子邮件 *' : 'Email *'}</label>}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder={lang === 'zh' ? '电子邮件' : 'Email'} required className={INPUT} />
          </div>
          <div>
            {isRegister && <label className="text-xs text-gray-500 mb-1 block">{lang === 'zh' ? '密码 * (最少 6 位)' : 'Password * (min 6 chars)'}</label>}
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder={lang === 'zh' ? '密码' : 'Password'} required minLength={6} className={INPUT} />
          </div>

          {isRegister && (
            <p className="text-xs text-gray-600 leading-relaxed">
              {lang === 'zh' ? '注册即表示你同意我们的' : 'By signing up you agree to our '}
              <a href="/legal/terms" className="text-[var(--gold)] hover:underline" target="_blank">{lang === 'zh' ? '服务条款' : 'Terms'}</a>
              {lang === 'zh' ? '和' : ' and '}
              <a href="/legal/privacy" className="text-[var(--gold)] hover:underline" target="_blank">{lang === 'zh' ? '隐私政策' : 'Privacy Policy'}</a>。
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dim)] text-[var(--navy)] rounded-xl py-3 font-bold text-base disabled:opacity-50 transition hover:shadow-lg hover:shadow-[var(--gold)]/20">
            {loading
              ? (lang === 'zh' ? '处理中...' : 'Processing...')
              : isRegister
                ? (lang === 'zh' ? '🎁 开始 7 天免费体验' : '🎁 Start 7-Day Free Trial')
                : (lang === 'zh' ? '登录' : 'Log In')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          {isRegister ? (lang === 'zh' ? '已有账户？' : 'Already have an account? ') : (lang === 'zh' ? '还没有账户？' : "Don't have an account? ")}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-[var(--gold)] ml-1 font-semibold hover:underline">
            {isRegister ? (lang === 'zh' ? '直接登录' : 'Log in') : (lang === 'zh' ? '免费注册' : 'Register free')}
          </button>
        </p>
      </div>
    </div>
  );
}
