
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AgentRole, AgentConfig, LogEntry, Source } from './types';
import { generateSwarmResponse } from './services/geminiService';
import AgentCard from './components/AgentCard';
import TerminalLog from './components/TerminalLog';
import ReportView from './components/ReportView';
import { Search, Play, RefreshCw, Zap, GripVertical } from 'lucide-react';

const AGENTS: Record<AgentRole, AgentConfig> = {
  [AgentRole.SCANNER]: {
    id: AgentRole.SCANNER,
    name: 'Scanner',
    description: 'Monitors real-time feeds & global indices.',
    icon: 'activity',
    color: 'cyan'
  },
  [AgentRole.VERIFIER]: {
    id: AgentRole.VERIFIER,
    name: 'Verifier',
    description: 'Cross-references claims against trusted dbs.',
    icon: 'shield',
    color: 'emerald'
  },
  [AgentRole.CONTEXTUALIZER]: {
    id: AgentRole.CONTEXTUALIZER,
    name: 'Contextualizer',
    description: 'Analyzes historical patterns & precedents.',
    icon: 'book',
    color: 'amber'
  },
  [AgentRole.WRITER]: {
    id: AgentRole.WRITER,
    name: 'Writer',
    description: 'Synthesizes intelligence into final brief.',
    icon: 'pen',
    color: 'purple'
  },
  [AgentRole.IDLE]: {
    id: AgentRole.IDLE,
    name: 'Orchestrator',
    description: 'System Standby',
    icon: 'monitor',
    color: 'slate'
  }
};

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentRole>(AgentRole.IDLE);
  const [agentStatus, setAgentStatus] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [reportMarkdown, setReportMarkdown] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  
  // Layout State
  const [sidebarWidth, setSidebarWidth] = useState(480);
  const [isDragging, setIsDragging] = useState(false);

  const addLog = useCallback((agent: AgentRole, message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      agent,
      message,
      type
    }]);
  }, []);

  // Resizing Logic
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newWidth = e.clientX;
      if (newWidth > 320 && newWidth < window.innerWidth - 400) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isDragging, resize, stopResizing]);

  const runSwarm = async () => {
    if (!topic.trim()) return;
    
    setIsRunning(true);
    setLogs([]);
    setSources([]);
    setReportMarkdown('');
    
    try {
      // --- PHASE 1: SCANNER (Discovery) ---
      setCurrentAgent(AgentRole.SCANNER);
      setAgentStatus('Scanning global news feeds and social signals...');
      addLog(AgentRole.IDLE, `INITIALIZING SWARM PROTOCOL: TARGET "${topic}"`);
      addLog(AgentRole.SCANNER, `Monitoring live feeds for keywords: ${topic}...`, 'thinking');

      const scannerPrompt = `Investigate the topic: "${topic}".
      Goal: Identify the absolute latest breaking news, events, or public discourse from the last 30 days.
      
      Instructions:
      1. Search for recent news articles and major updates.
      2. If this is a historical event (e.g., "Red Fort blast"), check if there are ANY new updates, anniversaries, or related recent incidents.
      3. If no recent news exists, explicitly state that the primary event is historical.
      
      Output: A concise summary of the CURRENT status or latest relevant occurrences.`;
      
      const scannerResult = await generateSwarmResponse(
        scannerPrompt,
        "You are an elite News Scanner. You find the truth in the noise. Prioritize recent facts. Be concise.",
        true
      );

      setSources(prev => [...prev, ...scannerResult.sources]);
      addLog(AgentRole.SCANNER, `Signal detected. Intelligence acquired.`, 'success');

      // --- PHASE 2: VERIFIER (Fact Checking) ---
      setCurrentAgent(AgentRole.VERIFIER);
      setAgentStatus('Cross-referencing claims with knowledge graph...');
      addLog(AgentRole.VERIFIER, `Validating intelligence against trusted sources...`, 'thinking');

      const verifierPrompt = `Validate the following findings about "${topic}":
      "${scannerResult.text}"
      
      Task:
      1. Verify if these events actually happened as described.
      2. Detect any potential misinformation or rumors.
      3. Confirm dates and key actors.
      
      Output: A "Verified Facts" bulleted list and a "Credibility Assessment" (High/Medium/Low).`;

      const verifierResult = await generateSwarmResponse(
        verifierPrompt,
        "You are a strict Fact Checker. You trust nothing until verified by search. Be skeptical.",
        true
      );

      setSources(prev => [...prev, ...verifierResult.sources]);
      addLog(AgentRole.VERIFIER, `Verification complete. Facts corroborated.`, 'success');

      // --- PHASE 3: CONTEXTUALIZER (Deep Dive) ---
      setCurrentAgent(AgentRole.CONTEXTUALIZER);
      setAgentStatus('Accessing historical archives and pattern matching...');
      addLog(AgentRole.CONTEXTUALIZER, `Querying deep history databases...`, 'thinking');

      const contextPrompt = `Provide the Master Context for: "${topic}".
      
      Based on the verified info:
      "${verifierResult.text}"
      
      Task:
      1. Explain the history. If this is a repeat event (like a blast at a landmark), give details of past occurrences (dates, casualties, outcome).
      2. Explain the significance. Why does this matter?
      3. Connect the dots between past and present.`;

      const contextResult = await generateSwarmResponse(
        contextPrompt,
        "You are a Historian and Intelligence Analyst. You provide the 'Why' and 'How'. You know everything about the past.",
        false 
      );

      addLog(AgentRole.CONTEXTUALIZER, `Contextual matrix established.`, 'success');

      // --- PHASE 4: WRITER (Synthesis) ---
      setCurrentAgent(AgentRole.WRITER);
      setAgentStatus('Compiling final investigative dossier...');
      addLog(AgentRole.WRITER, `Synthesizing Final Investigative Report...`, 'thinking');

      const writerPrompt = `Generate a highly structured "CONFIDENTIAL INTELLIGENCE DOSSIER" on: "${topic}".

      Inputs:
      - Latest News: ${scannerResult.text}
      - Verified Facts: ${verifierResult.text}
      - Context: ${contextResult.text}

      Format Requirements (Use strict Markdown):
      1. **Title**: Start with a # H1 Title (Catchy & Descriptive).
      2. **Executive Summary**: Use a > Blockquote for the core "Bottom Line Up Front" (BLUF). This should be a high-impact summary.
      3. **Sections**: Use ## H2 headers for "Situation Report", "Key Evidence", and "Historical Precedent".
      4. **Lists**: Use bullet points for facts and timeline events.
      5. **Emphasis**: Use **bold** for critical entities, dates, and threat levels.

      Tone: High-stakes intelligence briefing. Objective, urgent, precise. No fluff.`;

      const writerResult = await generateSwarmResponse(
        writerPrompt,
        "You are a Pulitzer-winning Senior Editor. You make complex topics clear and compelling.",
        false
      );

      addLog(AgentRole.WRITER, `Dossier generation complete.`, 'success');
      setReportMarkdown(writerResult.text); 
      addLog(AgentRole.IDLE, `MISSION ACCOMPLISHED. REPORT FILED.`, 'success');

    } catch (error: any) {
      console.error(error);
      addLog(AgentRole.IDLE, `CRITICAL ERROR: ${error.message || "Unknown Swarm Failure"}`, 'error');
      setAgentStatus('Protocol Aborted. System Failure.');
    } finally {
      setIsRunning(false);
      setCurrentAgent(AgentRole.IDLE);
      setAgentStatus('Standing by for next directive.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden select-none">
      
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-md flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-100">
            TruthSeeker <span className="text-cyan-500 font-light">AI</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs font-mono">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-full border border-slate-800">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             <span className="text-emerald-500 font-bold">SYSTEM ONLINE</span>
           </div>
           <div className="text-slate-500">
             V 2.5.0 (GEMINI-FLASH)
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Left Panel: Control Center (Resizable) */}
        <div 
          style={{ width: sidebarWidth }}
          className="flex-shrink-0 flex flex-col border-r border-slate-800 bg-slate-950/50 backdrop-blur-sm z-10 shadow-2xl"
        >
          
          {/* Input Area */}
          <div className="p-6 border-b border-slate-800 bg-slate-900/30">
            <div className="flex justify-between items-center mb-2">
               <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">
                 Target Parameters
               </label>
            </div>
            <div className="relative group">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isRunning && runSwarm()}
                placeholder="Enter investigation topic..."
                disabled={isRunning}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg pl-11 pr-4 py-4 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none disabled:opacity-50 font-medium placeholder:text-slate-600 shadow-inner"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-cyan-500 transition-colors" />
            </div>
            
            <button
              onClick={runSwarm}
              disabled={isRunning || !topic}
              className={`mt-4 w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-lg transition-all duration-300 border
                ${isRunning 
                  ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-cyan-600 hover:bg-cyan-500 border-cyan-500 hover:border-cyan-400 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]'
                }`}
            >
              {isRunning ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> SWARM ACTIVE...</>
              ) : (
                <><Play className="w-4 h-4 fill-current" /> INITIATE INVESTIGATION</>
              )}
            </button>
          </div>

          {/* Agent Status Grid */}
          <div className="p-6 grid grid-cols-2 gap-3 border-b border-slate-800 bg-slate-900/20">
            {[AgentRole.SCANNER, AgentRole.VERIFIER, AgentRole.CONTEXTUALIZER, AgentRole.WRITER].map((role) => (
              <AgentCard 
                key={role}
                config={AGENTS[role]} 
                isActive={currentAgent === role}
                status={agentStatus}
              />
            ))}
          </div>

          {/* Terminal Log */}
          <div className="flex-1 p-4 min-h-0 bg-black/20">
            <TerminalLog logs={logs} />
          </div>
        </div>

        {/* Drag Handle */}
        <div
          onMouseDown={startResizing}
          className={`w-1.5 cursor-col-resize flex items-center justify-center z-20 transition-colors duration-150 hover:bg-cyan-500/50 ${isDragging ? 'bg-cyan-500' : 'bg-slate-800'}`}
        >
           <div className="h-8 w-0.5 bg-slate-600 rounded-full opacity-50"></div>
        </div>

        {/* Right Panel: Report Output */}
        <div className="flex-1 flex flex-col bg-slate-100 relative overflow-hidden min-w-[400px]">
           {/* Cyber Grid Background */}
           <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
           <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#cffafe,transparent)] opacity-40 pointer-events-none"></div>
           
           <div className="flex-1 p-4 md:p-10 min-h-0 relative z-10 flex justify-center">
             <div className="w-full max-w-5xl h-full shadow-2xl rounded-xl overflow-hidden border border-slate-200/60">
                <ReportView 
                  markdown={reportMarkdown} 
                  sources={sources} 
                  isGenerating={isRunning}
                />
             </div>
           </div>
        </div>
        
        {/* Dragging Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 cursor-col-resize"></div>
        )}

      </main>
    </div>
  );
};

export default App;
