import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useLang from '../hooks/useLang';

export default function TrialBanner() {
  const [status, setStatus] = useState(null);
  const [lang] = useLang();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (!token) return;
    api.get('/api/trial-status')
      .then(r => setStatus(r.data))
      .catch(() => {});
  }, [token]);

  if (!status?.is_trial) return null;

  const { trial_queries_used, trial_queries_remaining, trial_days_left } = status;
  const allUsed  = trial_queries_remaining === 0;
  const expired  = trial_days_left === 0;
  const urgent   = trial_days_left <= 2 || trial_queries_remaining <= 1;

  const bgColor  = allUsed || expired ? 'bg-red-500/10 border-red-500/25' : urgent ? 'bg-yellow-500/8 border-yellow-500/25' : 'bg-[var(--gold)]/8 border-[var(--gold)]/20';
  const dotColor = allUsed || expired ? 'bg-red-400' : urgent ? 'bg-yellow-400' : 'bg-emerald-400';
  const textColor = allUsed || expired ? 'text-red-300' : urgent ? 'text-yellow-300' : 'text-[var(--gold-light)]';

  // Dot indicators for queries
  const dots = Array.from({ length: 3 }, (_, i) => i < trial_queries_used);

  return (
    <div className={`border rounded-xl px-5 py-3 flex items-center justify-between gap-4 flex-wrap mb-6 ${bgColor}`}>
      <div className="flex items-center gap-3">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 animate-pulse ${dotColor}`} />
        <div>
          <span className={`text-sm font-semibold ${textColor}`}>
            {allUsed || expired
              ? (lang === 'zh' ? '免费体验已结束' : 'Free trial ended')
              : (lang === 'zh' ? '免费体验中' : 'Free Trial Active')}
          </span>
          <span className="text-xs text-gray-500 ml-3">
            {lang === 'zh'
              ? `剩余 ${trial_days_left} 天 · `
              : `${trial_days_left} day${trial_days_left !== 1 ? 's' : ''} left · `}
          </span>

          {/* Query dots */}
          <span className="inline-flex gap-1 items-center ml-1">
            {dots.map((used, i) => (
              <span
                key={i}
                className={`w-3 h-3 rounded-full border ${used ? 'bg-[var(--gold)] border-[var(--gold)]' : 'bg-transparent border-gray-600'}`}
                title={used
                  ? (lang === 'zh' ? '已使用' : 'Used')
                  : (lang === 'zh' ? '可用' : 'Available')}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">
              {lang === 'zh'
                ? `${trial_queries_remaining} 次查询剩余`
                : `${trial_queries_remaining} quer${trial_queries_remaining !== 1 ? 'ies' : 'y'} left`}
            </span>
          </span>
        </div>
      </div>

      <Link
        to="/pricing"
        className="bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dim)] text-[var(--navy)] px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap hover:shadow-md hover:shadow-[var(--gold)]/20 transition"
      >
        {lang === 'zh' ? '升级 Pro →' : 'Upgrade Pro →'}
      </Link>
    </div>
  );
}
