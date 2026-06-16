import { Link, useNavigate } from 'react-router-dom';
import useLang from '../hooks/useLang';

export default function Navbar() {
  const [lang, setLang] = useLang();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('access_token');
  const zh = lang === 'zh';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--navy)]/90 backdrop-blur-xl border-b border-[var(--gold)]/15">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-[var(--gold)] flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dim)] rounded-lg flex items-center justify-center text-[var(--navy)] text-sm font-black">B</span>
          BullSage
        </Link>

        <div className="flex items-center gap-5">
          <Link to="/pricing" className="text-sm text-gray-400 hover:text-[var(--gold)] transition">
            {zh ? '定价' : 'Pricing'}
          </Link>
          <Link to="/feedback" className="text-sm text-gray-400 hover:text-[var(--gold)] transition">
            {zh ? '反馈' : 'Feedback'}
          </Link>
          {isLoggedIn && (
            <Link to="/dashboard" className="text-sm text-gray-400 hover:text-[var(--gold)] transition">
              {zh ? '面板' : 'Dashboard'}
            </Link>
          )}

          {/* Language toggle */}
          <div className="flex bg-white/5 border border-[var(--gold)]/15 rounded-full p-0.5">
            <button
              onClick={() => setLang('zh')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${lang === 'zh' ? 'bg-[var(--gold)] text-[var(--navy)]' : 'text-gray-400 hover:text-white'}`}
            >
              中
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${lang === 'en' ? 'bg-[var(--gold)] text-[var(--navy)]' : 'text-gray-400 hover:text-white'}`}
            >
              EN
            </button>
          </div>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-red-400 transition border border-white/10 hover:border-red-400/30 px-4 py-2 rounded-lg"
            >
              {zh ? '退出' : 'Log Out'}
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dim)] text-[var(--navy)] px-4 py-2 rounded-lg text-sm font-bold"
            >
              {zh ? '登录' : 'Login'}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
