import React, { useState } from 'react';
import {
  Sparkles, ShieldCheck, Mail, Lock, ArrowRight, CheckCircle2, User, KeyRound, Building2
} from 'lucide-react';

export default function LoginPage({ onLogin, personas = [] }) {
  const [email, setEmail] = useState('navin.rajaa@enterprise.com');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedPersona, setSelectedPersona] = useState(personas[0] || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        email: email || 'user@enterprise.com',
        name: selectedPersona?.name || 'Navin Rajaa',
        role: selectedPersona?.role || 'Senior Tech Lead & AI Engineer',
        avatar: selectedPersona?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        persona: selectedPersona
      });
    }, 400);
  };

  const handleSelectQuickPersona = (persona) => {
    setSelectedPersona(persona);
    setEmail(persona.email || `${persona.name.toLowerCase().replace(/\s+/g, '.')}@enterprise.com`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">

      {/* Container Box */}
      <div className="w-full max-w-md space-y-6">

        {/* Header & Logo Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-xs">

            <span>PathCraft AI Learning Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-outfit tracking-tight">
            Welcome back!
          </h1>
          <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
            Personalized adaptive learning roadmaps, skill verification, and internal mobility for modern teams.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">

          {/* Quick 1-Click Demo Persona Selector */}
          {personas && personas.length > 0 && (
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Quick 1-Click Login as Employee:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {personas.slice(0, 4).map((p) => {
                  const isSelected = selectedPersona?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectQuickPersona(p)}
                      className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-left transition cursor-pointer ${isSelected
                          ? 'bg-blue-50/80 border-blue-600 text-blue-950 ring-2 ring-blue-100'
                          : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100/80'
                        }`}
                    >
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="truncate min-w-0">
                        <div className="text-xs font-bold truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{p.role}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
              or enter credentials
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  placeholder="employee@enterprise.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Password</span>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] text-blue-600 hover:underline">
                  Forgot?
                </a>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <span>Sign In to Learning Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

        </div>

        {/* Footer Security Badges */}
        <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-500">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>SOC-2 Encrypted</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Enterprise SSO Enabled</span>
          </span>
        </div>

      </div>

    </div>
  );
}
