import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Search,
  Radio,
  Activity,
  Calculator,
  Layers,
  History,
  Lock,
  BookOpen,
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onOpenAuth }) => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'lookup', label: 'IP Intelligence', icon: Search },
    { id: 'detection', label: 'VPN / Proxy', icon: Radio },
    { id: 'leak-test', label: 'Leak Analysis', icon: ShieldAlert },
    { id: 'tools', label: 'Network Tools', icon: Calculator },
    { id: 'bulk', label: 'Bulk Scan', icon: Layers },
    { id: 'history', label: 'History', icon: History },
    { id: 'help', label: 'Help & Docs', icon: BookOpen },
  ];

  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin', icon: Lock });
  }

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-cyber-dark/85 backdrop-blur-md border-b border-cyber-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleNav('landing')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow-cyan">
              <Radio className="w-5 h-5 text-black group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                NETDEFENSE <span className="text-cyan-400 font-mono text-xs px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800">INTEL</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono tracking-wide -mt-0.5">
                VPN & PROXY IP DETECTION SYSTEM
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-glow-cyan'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 bg-slate-900/90 border border-cyber-border rounded-lg p-1 pr-2">
                <div className="w-7 h-7 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold">
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                    {user.fullName || user.email}
                  </div>
                  <div className="text-[9px] font-mono text-cyan-400 uppercase">
                    {user.role === 'admin' ? 'SYSTEM ADMIN' : 'ANALYST'}
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs tracking-wide transition-all shadow-glow-cyan"
              >
                <User className="w-3.5 h-3.5 text-black" />
                <span>Sign In / Demo</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-cyber-dark/95 border-b border-cyber-border px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-slate-400">{user.email}</span>
                <button
                  onClick={() => signOut()}
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2 text-center rounded-lg bg-cyan-500 text-black font-semibold text-xs"
              >
                Sign In / Guest Access
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
