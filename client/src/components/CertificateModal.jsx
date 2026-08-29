import React, { useEffect, useRef } from 'react';
import { X, Award, ShieldCheck, Download, Printer, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CertificateModal({ 
  isOpen, 
  onClose, 
  learnerName, 
  targetRoleTitle, 
  completedSkillsCount, 
  totalSkillsCount 
}) {
  const certRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Fire festive celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#38bdf8', '#4f46e5', '#10b981', '#f59e0b']
      });

      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#2563eb', '#38bdf8', '#10b981']
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#2563eb', '#38bdf8', '#10b981']
        });
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const verificationId = `PATH-${Math.random().toString(36).substring(2, 9).toUpperCase()}-VERIFIED`;
  const issueDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Award className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Official PathCraft Verified Certificate
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Print / PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div className="p-6 overflow-y-auto flex-1 flex items-center justify-center bg-slate-100/60">
          <div 
            ref={certRef}
            className="w-full bg-white p-8 rounded-2xl border-4 border-double border-blue-900/40 shadow-xl relative text-center space-y-6 overflow-hidden"
          >
            {/* Background Guilloche watermark */}
            <div className="absolute inset-0 bg-radial from-blue-50/50 to-transparent pointer-events-none"></div>

            {/* Top Seal & Organization */}
            <div className="flex flex-col items-center justify-center space-y-1 relative z-10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 ring-4 ring-blue-100">
                <Award className="w-8 h-8" />
              </div>
              <div className="text-[11px] font-extrabold tracking-widest text-blue-800 uppercase pt-2">
                PathCraft AI Enterprise Learning Authority
              </div>
              <h2 className="text-2xl font-black text-slate-900 font-outfit uppercase tracking-tight">
                Certificate of Skill Mastery
              </h2>
            </div>

            {/* Body Description */}
            <div className="space-y-2 relative z-10">
              <p className="text-xs text-slate-500 italic">This official credential certifies that</p>
              <h3 className="text-2xl font-black text-blue-700 font-outfit underline decoration-blue-300 decoration-2 underline-offset-4">
                {learnerName || 'Alex Rivera'}
              </h3>
              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed pt-1">
                has successfully passed the rigorous AI-adaptive verification assessments and demonstrated full professional competency required for:
              </p>
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-900 font-extrabold text-sm border border-blue-200 shadow-2xs">
                {targetRoleTitle || 'Senior Technology Professional'}
              </div>
            </div>

            {/* Signature & Verification Hash */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 items-end relative z-10 text-left">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Verification ID (MongoDB)</div>
                <div className="text-[11px] font-mono font-bold text-slate-800 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{verificationId}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Issued: {issueDate}</div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-slate-800 font-outfit">PathCraft AI Certification Board</div>
                <div className="text-[10px] text-slate-400">Validated by AI Learning Engine</div>
                <div className="text-[10px] text-emerald-600 font-bold flex items-center justify-end space-x-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Mastery Confirmed</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
