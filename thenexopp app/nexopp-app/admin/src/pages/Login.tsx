import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('thenexopp_admin_2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed. Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#E8E2D8] rounded-2xl p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="h-16 w-16 bg-[#DDE3DA] border border-[#BAC7B6] rounded-2xl flex items-center justify-center text-[#2C3629] mx-auto">
            <Shield className="h-8 w-8 text-[#5F7359]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1B211E] tracking-tight">Executive Admin Portal</h2>
          <p className="text-sm text-[#6E736E]">TheNexopp Agent Production Management</p>
        </div>

        {error && (
          <div className="bg-[#FAECEB] border border-[#E8BFBA] text-[#8F3329] px-4 py-3 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1B211E] mb-1">Admin Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-[#6E736E]" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1B211E] focus:outline-none focus:bg-white focus:border-[#1B211E] focus:ring-2 focus:ring-[#1B211E]/10"
                placeholder="Enter admin username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1B211E] mb-1">Admin Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-[#6E736E]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1B211E] focus:outline-none focus:bg-white focus:border-[#1B211E] focus:ring-2 focus:ring-[#1B211E]/10"
                placeholder="Enter admin password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1B211E] hover:bg-[#2C3629] font-semibold py-3 rounded-xl text-white shadow-md shadow-[#1B211E]/15 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Portal'}
          </button>
        </form>

        <div className="text-center text-xs text-[#6E736E] pt-2 border-t border-[#E8E2D8] font-medium">
          Protected by AES-256 Encryption & Direct Credential Access
        </div>
      </div>
    </div>
  );
};
