import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TickerInput({ size = 'lg' }) {
  const [ticker, setTicker] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticker.trim()) navigate(`/analyze/${ticker.trim().toUpperCase()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={ticker}
        onChange={(e) => setTicker(e.target.value.toUpperCase())}
        placeholder="AAPL, 0700.HK, TSLA..."
        maxLength={10}
        className={`flex-1 bg-[var(--navy)] border border-[var(--gold)]/25 rounded-xl text-white font-mono tracking-wider uppercase outline-none focus:border-[var(--gold)] transition ${size === 'lg' ? 'px-5 py-4 text-lg' : 'px-4 py-3 text-base'}`}
      />
      <button type="submit" className={`bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dim)] text-[var(--navy)] rounded-xl font-bold whitespace-nowrap hover:shadow-lg hover:shadow-[var(--gold)]/20 transition ${size === 'lg' ? 'px-8 py-4 text-lg' : 'px-6 py-3'}`}>
        获取裁决
      </button>
    </form>
  );
}
