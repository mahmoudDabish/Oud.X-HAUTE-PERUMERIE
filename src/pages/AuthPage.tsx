import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Button } from '../components/ui/Button';
import { Lock, Mail, User, Phone, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, user, navigateTo } = useShop();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    navigateTo('/account');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (mode === 'login') {
        login(email || 'karim.elsayed@luxury.com', password || 'password');
      } else {
        register(name || 'Karim El-Sayed', email || 'karim.elsayed@luxury.com', password || 'password', phone);
      }
      setIsLoading(false);
      navigateTo('/account');
    }, 600);
  };

  const handleDemoLogin = () => {
    login('karim.elsayed@luxury.com', 'demo123');
    navigateTo('/account');
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F2EA] py-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/35 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Ambient glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C9A45C] to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#C9A45C]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <span className="font-cinzel text-xl font-extrabold tracking-[0.25em] text-[#F5F2EA] block">
            OUD<span className="text-[#C9A45C]">_</span>X
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F2EA]">
            {mode === 'login' ? 'Privé Client Sign In' : 'Create Privé Account'}
          </h1>
          <p className="text-xs text-[#A7A29A]">
            Access your personalized fragrance vault, private releases & order history.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex border-b border-white/10 text-xs">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 font-semibold tracking-wider transition-colors uppercase ${
              mode === 'login'
                ? 'text-[#E3C27A] border-b-2 border-[#C9A45C]'
                : 'text-[#A7A29A] hover:text-[#F5F2EA]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2.5 font-semibold tracking-wider transition-colors uppercase ${
              mode === 'register'
                ? 'text-[#E3C27A] border-b-2 border-[#C9A45C]'
                : 'text-[#A7A29A] hover:text-[#F5F2EA]'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[#A7A29A] mb-1 font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A45C]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Karim El-Sayed"
                    className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded py-2.5 pl-9 pr-3 text-[#F5F2EA] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A7A29A] mb-1 font-medium">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A45C]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 100 123 4567"
                    className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded py-2.5 pl-9 pr-3 text-[#F5F2EA] focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[#A7A29A] mb-1 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A45C]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded py-2.5 pl-9 pr-3 text-[#F5F2EA] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#A7A29A] mb-1 font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A45C]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded py-2.5 pl-9 pr-3 text-[#F5F2EA] focus:outline-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            {mode === 'login' ? 'ENTER PRIVÉ ATELIER' : 'CREATE PRIVILEGE ACCOUNT'}
          </Button>

          {/* Quick Demo Access */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 rounded bg-[#11100E] border border-[#C9A45C]/40 text-xs font-semibold text-[#E3C27A] hover:bg-[#C9A45C]/10 transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> 1-Click VIP Demo Account Access
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-2 text-[10px] text-[#8E713D]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Encrypted with OUD_X Privé Security Standards</span>
        </div>

      </div>
    </div>
  );
};
