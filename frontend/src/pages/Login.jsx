import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const res = await api.post(endpoint, { email, password });
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('user_email', res.data.email);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-[var(--navy-light)] border border-[var(--gold)]/15 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          {isRegister ? '创建账户' : '登录'}
        </h2>
        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="邮箱" required
            className="w-full bg-[var(--navy)] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[var(--gold)]" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" required minLength={6}
            className="w-full bg-[var(--navy)] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[var(--gold)]" />
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dim)] text-[var(--navy)] rounded-lg py-3 font-bold disabled:opacity-50">
            {loading ? '处理中...' : isRegister ? '注册' : '登录'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          {isRegister ? '已有账户？' : '没有账户？'}
          <button onClick={() => setIsRegister(!isRegister)} className="text-[var(--gold)] ml-1">
            {isRegister ? '登录' : '注册'}
          </button>
        </p>
      </div>
    </div>
  );
}
