import React, { useState, useEffect } from 'react';
import { 
  X, Terminal, MessageSquare, AlertTriangle, Database, Activity, Code2, 
  RefreshCw, CheckCircle2, ServerCrash, Clock, ShieldCheck 
} from 'lucide-react';

const OUTAGE_SCENARIO = {
  title: 'SEV-1: High-Volume Ingestion Drop',
  time: '03:14 AM — On-Call PagerDuty Alert',
  description: 'The telemetry ingestion pipeline is dropping 15% of events. Business dashboard is throwing 500 errors.',
  tools: [
    { id: 'datadog', label: 'Check Datadog Logs', icon: Activity, delay: 1500, log: '[Datadog] ERRO: Redis OOM (Out of Memory) detected on ingress-cache-01.' },
    { id: 'query_db', label: 'Query Postgres DB', icon: Database, delay: 2000, log: '[Postgres] Conn_Pool_Exhausted. 100/100 active connections.' },
    { id: 'restart_pod', label: 'Restart K8s Pod', icon: RefreshCw, delay: 3000, log: '[K8s] ingress-cache-01 restarted. Memory cleared, but filling up fast.' },
    { id: 'scale_redis', label: 'Scale Redis Buffer', icon: ServerCrash, delay: 2500, log: '[Infra] Scaled Redis maxmemory to 8GB. Ingestion stabilized.' }
  ]
};

export default function DayInTheLifeModal({ isOpen, onClose, targetRoleTitle }) {
  const [logs, setLogs] = useState([]);
  const [slackMessages, setSlackMessages] = useState([]);
  const [activeTools, setActiveTools] = useState(new Set());
  const [isResolved, setIsResolved] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setLogs([]);
      setSlackMessages([]);
      setActiveTools(new Set());
      setIsResolved(false);
      setScore(0);
      return;
    }

    // Initial sequence
    setLogs([{ text: `[SYSTEM] Authenticated as ${targetRoleTitle || 'Senior Engineer'}`, time: '03:14:00' }]);
    
    setTimeout(() => {
      setLogs(prev => [...prev, { text: `[PAGERDUTY] SEV-1 ALARM: 15% packet drop on ingestion pipeline.`, time: '03:14:05', alert: true }]);
    }, 1000);

    setTimeout(() => {
      setSlackMessages([{ sender: '@product_manager', msg: 'Hey, the live ops dashboard is down! Are we losing data??' }]);
    }, 2500);

  }, [isOpen]);

  const handleUseTool = (tool) => {
    if (activeTools.has(tool.id) || isResolved) return;
    
    setActiveTools(prev => new Set(prev).add(tool.id));
    setLogs(prev => [...prev, { text: `> Executing: ${tool.label}...`, time: new Date().toLocaleTimeString('en-US', { hour12: false }) }]);
    
    setTimeout(() => {
      setLogs(prev => [...prev, { text: tool.log, time: new Date().toLocaleTimeString('en-US', { hour12: false }) }]);
      
      // Dynamic Slack Reactions
      if (tool.id === 'datadog') {
        setSlackMessages(prev => [...prev, { sender: '@devops_lead', msg: 'OOM error? Check the redis maxmemory config.' }]);
      }
      
      if (tool.id === 'scale_redis') {
        setSlackMessages(prev => [...prev, { sender: '@devops_lead', msg: 'Nice catch. Memory looks stable now.' }]);
        setTimeout(() => setIsResolved(true), 2000);
        setScore(prev => prev + 150);
      } else {
        setScore(prev => prev + 25);
      }
    }, tool.delay);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0a0a0a] border border-slate-800 rounded-xl w-full max-w-5xl h-[85vh] flex flex-col font-mono shadow-2xl overflow-hidden relative">
        
        {/* Header - Hacker Style */}
        <div className="bg-[#111] px-4 py-3 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-slate-300 font-bold text-sm tracking-widest uppercase">Incident War Room RPG</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-rose-500 font-bold animate-pulse">SLA: 14m 22s</span>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 min-h-0">
          
          {/* Left Panel: Scenario & Tools */}
          <div className="border-r border-slate-800 flex flex-col min-h-0 bg-[#0f0f0f]">
            <div className="p-4 border-b border-slate-800 shrink-0">
              <span className="text-rose-500 text-[10px] font-bold uppercase tracking-widest">{OUTAGE_SCENARIO.time}</span>
              <h2 className="text-white text-lg font-bold mt-1 leading-tight">{OUTAGE_SCENARIO.title}</h2>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">{OUTAGE_SCENARIO.description}</p>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <Terminal className="w-3 h-3" /> Available Actions
              </h3>
              <div className="space-y-2">
                {OUTAGE_SCENARIO.tools.map((tool) => (
                  <button
                    key={tool.id}
                    disabled={activeTools.has(tool.id) || isResolved}
                    onClick={() => handleUseTool(tool)}
                    className={`w-full p-3 rounded-lg border text-left text-xs font-bold flex items-center space-x-3 transition ${
                      activeTools.has(tool.id)
                        ? 'bg-[#111] border-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-[#1a1a1a] border-slate-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-400'
                    }`}
                  >
                    <tool.icon className={`w-4 h-4 ${activeTools.has(tool.id) ? 'text-slate-600' : 'text-blue-500'}`} />
                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Panel: Terminal Logs */}
          <div className="col-span-1 md:col-span-2 flex flex-col min-h-0 bg-black relative">
            
            {/* Resolution Overlay */}
            {isResolved && (
              <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-fadeIn">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                <h2 className="text-3xl font-black text-white font-outfit mb-2">INCIDENT RESOLVED</h2>
                <p className="text-emerald-400 text-sm font-bold mb-6">+{score} Senior Architect XP</p>
                <button onClick={onClose} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition uppercase tracking-widest cursor-pointer">
                  End Simulation
                </button>
              </div>
            )}

            {/* Terminal Output */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px]" id="rpg-terminal">
              {logs.map((log, i) => (
                <div key={i} className={`flex items-start ${log.alert ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                  <span className="text-slate-600 mr-3 shrink-0">[{log.time}]</span>
                  <span className="leading-relaxed">{log.text}</span>
                </div>
              ))}
              {!isResolved && (
                <div className="flex items-center text-slate-500 pt-2">
                  <span className="mr-2">&gt;</span><span className="animate-pulse">_</span>
                </div>
              )}
            </div>

            {/* Slack Popups Area */}
            <div className="h-48 border-t border-slate-800 bg-[#0a0a0a] p-4 overflow-y-auto shrink-0 flex flex-col justify-end space-y-2">
              <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3" /> Team Comms
              </div>
              {slackMessages.map((msg, i) => (
                <div key={i} className="bg-[#111] border border-slate-800 rounded-lg p-2.5 flex items-start space-x-3 animate-fadeIn">
                  <div className="w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <span className="text-indigo-400 font-bold text-[10px]">{msg.sender[1].toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-indigo-400 mb-0.5">{msg.sender}</div>
                    <div className="text-xs text-slate-300">{msg.msg}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
