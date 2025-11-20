import React, { useEffect, useRef } from 'react';
import { LogEntry, AgentRole } from '../types';

interface TerminalLogProps {
  logs: LogEntry[];
}

const TerminalLog: React.FC<TerminalLogProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const getAgentColor = (agent: AgentRole) => {
    switch (agent) {
      case AgentRole.SCANNER: return 'text-cyan-400';
      case AgentRole.VERIFIER: return 'text-emerald-400';
      case AgentRole.CONTEXTUALIZER: return 'text-amber-400';
      case AgentRole.WRITER: return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs md:text-sm overflow-hidden shadow-inner">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <span className="text-slate-400 font-semibold flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
          SWARM_ACTIVITY.LOG
        </span>
        <span className="text-xs text-slate-600">Live Stream</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {logs.length === 0 && (
          <div className="text-slate-600 italic">Waiting for mission parameters...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 animate-fade-in">
            <span className="text-slate-600 min-w-[60px]">
              {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className={`font-bold uppercase tracking-wider min-w-[110px] ${getAgentColor(log.agent)}`}>
              [{log.agent === AgentRole.IDLE ? 'SYSTEM' : log.agent}]
            </span>
            <span className={`flex-1 break-words ${log.type === 'error' ? 'text-red-400' : 'text-slate-300'}`}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default TerminalLog;