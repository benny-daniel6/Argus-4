import React from 'react';
import { AgentRole, AgentConfig } from '../types';
import { Activity, ShieldCheck, BookOpen, PenTool, Monitor } from 'lucide-react';

interface AgentCardProps {
  config: AgentConfig;
  isActive: boolean;
  status: string;
}

const AgentCard: React.FC<AgentCardProps> = ({ config, isActive, status }) => {
  
  const getIcon = () => {
    switch (config.id) {
      case AgentRole.SCANNER: return <Activity className="w-6 h-6" />;
      case AgentRole.VERIFIER: return <ShieldCheck className="w-6 h-6" />;
      case AgentRole.CONTEXTUALIZER: return <BookOpen className="w-6 h-6" />;
      case AgentRole.WRITER: return <PenTool className="w-6 h-6" />;
      default: return <Monitor className="w-6 h-6" />;
    }
  };

  return (
    <div className={`
      relative p-4 rounded-xl border transition-all duration-300
      ${isActive 
        ? `bg-slate-900 border-${config.color}-500 shadow-[0_0_20px_-5px_rgba(var(--${config.color}-rgb),0.3)] scale-105 z-10` 
        : 'bg-slate-900/50 border-slate-800 opacity-70 grayscale-[0.5]'}
    `}>
      <div className="flex items-start justify-between mb-3">
        <div className={`
          p-2 rounded-lg 
          ${isActive ? `bg-${config.color}-500/20 text-${config.color}-400` : 'bg-slate-800 text-slate-400'}
        `}>
          {getIcon()}
        </div>
        {isActive && (
          <span className="flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${config.color}-400 opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 bg-${config.color}-500`}></span>
          </span>
        )}
      </div>
      
      <h3 className="text-lg font-bold text-slate-100 mb-1">{config.name}</h3>
      <p className="text-xs text-slate-400 mb-3 h-8 leading-tight line-clamp-2">{config.description}</p>
      
      <div className="h-6 flex items-center">
         {isActive ? (
           <span className={`text-xs font-mono text-${config.color}-400 animate-pulse`}>
             &gt; {status}
           </span>
         ) : (
           <span className="text-xs font-mono text-slate-600">IDLE</span>
         )}
      </div>
    </div>
  );
};

export default AgentCard;