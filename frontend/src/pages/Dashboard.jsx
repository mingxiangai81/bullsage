import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWatchlist, getReports, removeFromWatchlist, addToWatchlist } from '../services/api';
import TrialBanner from '../components/TrialBanner';
import useLang from '../hooks/useLang';

export default function Dashboard() {
  const [watchlist, setWatchlist] = useState([]);
  const [reports, setReports] = useState([]);
  const [newTicker, setNewTicker] = useState('');
  const [addError, setAddError] = useState('');
  const navigate = useNavigate();
  const [lang] = useLang();
  const zh = lang === 'zh';

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { navigate('/login'); return; }
    getWatchlist().then(r => setWatchlist(r.data)).catch(() => {});
    getReports().then(r => setReports(r.data)).catch(() => {});
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const val = newTicker.trim().toUpperCase();
    if (!val) return;
    setAddError('');
    try {
      await addToWatchlist(val);
      setNewTicker('');
      const r = await getWatchlist();
      setWatchlist(r.data);
    } catch (err) {
      setAddError(err.response?.data?.detail || (zh ? '添加失败' : 'Failed to add'));
    }
  };

  const handleRemove = async (ticker) => {
    try {
      await removeFromWatchlist(ticker);
      setWatchlist(prev => prev.filter(w => w.ticker !== ticker));
    } catch { /* ignore */ }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
    navigate('/login');
  };

  return (
    <div className="pt-20 pb-16 max-w-4xl mx-auto px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{zh ? '我的面板' : 'My Dashboard'}</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-400 transition border border-white/10 hover:border-red-400/30 px-3 py-1.5 rounded-lg"
        >
          {zh ? '退出登录' : 'Log Out'}
        </button>
      </div>
      <TrialBanner />

      <div className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--gold)] mb-4">{zh ? '自选股' : 'Watchlist'}</h2>
        <form onSubmit={handleAdd} className="flex gap-2 mb-2">
          <input
            value={newTicker}
            onChange={e => setNewTicker(e.target.value.toUpperCase())}
            placeholder={zh ? '添加股票代码...' : 'Add ticker (e.g. AAPL)'}
            className="flex-1 bg-[var(--navy)] border border-white/10 rounded-lg px-4 py-2 text-white font-mono outline-none focus:border-[var(--gold)]"
          />
          <button type="submit" className="bg-[var(--gold)] text-[var(--navy)] px-4 py-2 rounded-lg font-bold text-sm">
            {zh ? '添加' : 'Add'}
          </button>
        </form>
        {addError && <p className="text-red-400 text-xs mb-3">{addError}</p>}
        <div className="flex flex-wrap gap-2 mt-3">
          {watchlist.map(w => (
            <div key={w.ticker} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
              <Link to={`/analyze/${w.ticker}`} className="font-mono text-sm text-white hover:text-[var(--gold)]">{w.ticker}</Link>
              <button onClick={() => handleRemove(w.ticker)} className="text-red-400 text-xs hover:text-red-300 leading-none">×</button>
            </div>
          ))}
          {watchlist.length === 0 && (
            <p className="text-sm text-gray-500">{zh ? '还没有自选股，搜索一只股票添加' : 'No watchlist items yet'}</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[var(--gold)] mb-4">{zh ? '历史报告' : 'Report History'}</h2>
        <div className="space-y-2">
          {reports.map(r => (
            <Link
              key={r.id}
              to={`/analyze/${r.ticker}`}
              className="flex justify-between items-center bg-white/5 border border-white/5 rounded-lg px-4 py-3 hover:border-[var(--gold)]/20 transition"
            >
              <span className="font-mono text-white">{r.ticker}</span>
              <span className="text-xs text-gray-500">
                {new Date(r.created_at).toLocaleDateString(zh ? 'zh-CN' : 'en-US')}
              </span>
            </Link>
          ))}
          {reports.length === 0 && (
            <p className="text-sm text-gray-500">{zh ? '还没有历史报告，分析一只股票试试' : 'No reports yet — analyze a stock to get started'}</p>
          )}
        </div>
      </div>
    </div>
  );
}
