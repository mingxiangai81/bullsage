import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWatchlist, getReports, removeFromWatchlist, addToWatchlist } from '../services/api';

export default function Dashboard() {
  const [watchlist, setWatchlist] = useState([]);
  const [reports, setReports] = useState([]);
  const [newTicker, setNewTicker] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    getWatchlist().then(r => setWatchlist(r.data)).catch(() => {});
    getReports().then(r => setReports(r.data)).catch(() => {});
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTicker.trim()) return;
    try {
      await addToWatchlist(newTicker.trim());
      setNewTicker('');
      const r = await getWatchlist();
      setWatchlist(r.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed');
    }
  };

  const handleRemove = async (ticker) => {
    await removeFromWatchlist(ticker);
    setWatchlist(watchlist.filter(w => w.ticker !== ticker));
  };

  return (
    <div className="pt-20 pb-16 max-w-4xl mx-auto px-6">
      <h1 className="text-2xl font-bold text-white mb-8">我的面板</h1>

      <div className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--gold)] mb-4">自选股</h2>
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input value={newTicker} onChange={e => setNewTicker(e.target.value.toUpperCase())} placeholder="添加股票代码..."
            className="flex-1 bg-[var(--navy)] border border-white/10 rounded-lg px-4 py-2 text-white font-mono outline-none focus:border-[var(--gold)]" />
          <button type="submit" className="bg-[var(--gold)] text-[var(--navy)] px-4 py-2 rounded-lg font-bold text-sm">添加</button>
        </form>
        <div className="flex flex-wrap gap-2">
          {watchlist.map(w => (
            <div key={w.ticker} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
              <Link to={`/analyze/${w.ticker}`} className="font-mono text-sm text-white hover:text-[var(--gold)]">{w.ticker}</Link>
              <button onClick={() => handleRemove(w.ticker)} className="text-red-400 text-xs hover:text-red-300">x</button>
            </div>
          ))}
          {watchlist.length === 0 && <p className="text-sm text-gray-500">还没有自选股</p>}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[var(--gold)] mb-4">历史报告</h2>
        <div className="space-y-2">
          {reports.map(r => (
            <Link key={r.id} to={`/analyze/${r.ticker}`}
              className="flex justify-between items-center bg-white/5 border border-white/5 rounded-lg px-4 py-3 hover:border-[var(--gold)]/20 transition">
              <span className="font-mono text-white">{r.ticker}</span>
              <span className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</span>
            </Link>
          ))}
          {reports.length === 0 && <p className="text-sm text-gray-500">还没有历史报告</p>}
        </div>
      </div>
    </div>
  );
}
