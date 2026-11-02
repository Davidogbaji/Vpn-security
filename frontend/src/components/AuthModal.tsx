import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, ShieldCheck, Key, Database, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, simulateGuestLogin, isConfigured } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        const res = await signUp(email, password, fullName);
        if (res.error) setError(res.error);
        else onClose();
      } else {
        const res = await signIn(email, password);
        if (res.error) setError(res.error);
        else onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: 'user' | 'admin') => {
    simulateGuestLogin(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-cyber-card border border-cyber-border rounded-2xl shadow-glass overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-cyber-dark p-6 border-b border-cyber-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                {isRegistering ? 'Create Analyst Account' : 'Analyst Authentication'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {isConfigured ? 'Supabase Database Connected' : 'Demo & Local Environment Mode'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Supabase Status Pill */}
        <div className="px-6 pt-4 pb-2">
          {isConfigured ? (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <Database className="w-4 h-4" />
              <span>Connected to live Supabase PostgreSQL backend.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span>Demo Mode: You can sign in instantly with one click below or enter credentials.</span>
            </div>
          )}
        </div>

        {/* Quick Demo Access Buttons */}
        <div className="px-6 py-2">
          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
            One-Click Quick Access (Zero Setup)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('user')}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Guest Analyst</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 border border-cyan-800 text-xs font-medium transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Lab Admin</span>
            </button>
          </div>
        </div>

        <div className="px-6 py-2 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[11px] text-slate-500 font-mono uppercase">Or Enter Email</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {isRegistering && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Security Analyst Name"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@cybersecurity.lab"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-sm transition-all shadow-glow-cyan disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isRegistering ? 'Register Account' : 'Sign In'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-cyan-400 hover:underline"
            >
              {isRegistering
                ? 'Already have an account? Sign In'
                : "Don't have an account? Register here"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
