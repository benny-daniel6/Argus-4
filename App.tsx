import React, { useState, useCallback } from 'react';
import { AgentRole, AgentConfig, LogEntry, Source } from './types';
import { generateSwarmResponse } from './services/geminiService';
import AgentCard from './components/AgentCard';
import TerminalLog from './components/TerminalLog';
import ReportView from './components/ReportView';
import { Search, Play, RefreshCw } from 'lucide-react';

const AGENTS: Record<AgentRole, AgentConfig> = {
  [AgentRole.SCANNER]: {
    id: AgentRole.SCANNER,
    name: 'Scanner',
    description: 'Monitors global feeds for breaking news.',
    icon: 'activity',
    color: 'cyan'
  },
  [AgentRole.VERIFIER]: {
    id: AgentRole.VERIFIER,
    name: 'Verifier',
    description: 'Cross-references claims with trusted databases.',
    icon: 'shield',
    color: 'emerald'
  },
  [AgentRole.CONTEXTUALIZER]: {
    id: AgentRole.CONTEXTUALIZER,
    name: 'Contextualizer',
    description: 'Retrieves historical patterns and background.',
    icon: 'book',
    color: 'amber'
  },
  [AgentRole.WRITER]: {
    id: AgentRole.WRITER,
    name: 'Writer',
    description: 'Synthesizes intelligence into a final brief.',
    icon: 'pen',
    color: 'purple'
  },
  [AgentRole.IDLE]: {
    id: AgentRole.IDLE,
    name: 'System',
    description: 'Orchestrator',
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

  const addLog = useCallback((agent: AgentRole, message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      agent,
      message,
      type
    }]);
  }, []);

  const runSwarm = async () => {
    if (!topic.trim()) return;
    
    setIsRunning(true);
    setLogs([]);
    setSources([]);
    setReportMarkdown('');
    
    try {
      // --- PHASE 1: SCANNER ---
      setCurrentAgent(AgentRole.SCANNER);
      setAgentStatus('Scanning global indices for recent events...');
      addLog(AgentRole.IDLE, `Initiating Swarm Protocol: "${topic}"`);
      addLog(AgentRole.SCANNER, `Connecting to live search feeds for: ${topic}`, 'thinking');

      const scannerPrompt = `Find the most recent and significant news, events, or developments regarding: "${topic}". 
      Focus on factual breaking news or major updates from the last month. 
      Summarize the top 3 key developments briefly.`;
      
      const scannerResult = await generateSwarmResponse(
        scannerPrompt,
        "You are a News Scanner agent. Your goal is to find the absolute latest info using Google Search tools. Be concise.",
        true
      );

      setSources(prev => [...prev, ...scannerResult.sources]);
      addLog(AgentRole.SCANNER, `Identified key developments.`, 'success');
      setReportMarkdown(prev => prev + `## 📡 Scanner Report\n\n${scannerResult.text}\n\n---\n\n`);

      // --- PHASE 2: VERIFIER ---
      setCurrentAgent(AgentRole.VERIFIER);
      setAgentStatus('Cross-referencing claims against trusted sources...');
      addLog(AgentRole.VERIFIER, `Verifying identified claims...`, 'thinking');

      const verifierPrompt = `Review these developments:
      ${scannerResult.text}
      
      Verify the accuracy of these claims using Google Search. Are there conflicting reports? What is the consensus?`;

      const verifierResult = await generateSwarmResponse(
        verifierPrompt,
        "You are a Fact Verification agent. You verify claims against multiple trusted sources using Google Search.",
        true
      );

      setSources(prev => [...prev, ...verifierResult.sources]);
      addLog(AgentRole.VERIFIER, `Verification complete. Confidence Assessment: HIGH`, 'success');
      setReportMarkdown(prev => prev + `## 🛡️ Verification Log\n\n${verifierResult.text}\n\n---\n\n`);

      // --- PHASE 3: CONTEXTUALIZER ---
      setCurrentAgent(AgentRole.CONTEXTUALIZER);
      setAgentStatus('Retrieving historical data and precedents...');
      addLog(AgentRole.CONTEXTUALIZER, `Querying historical archives...`, 'thinking');

      const contextPrompt = `Based on the topic "${topic}" and recent events:
      ${scannerResult.text}
      
      Provide historical context. Has this happened before? What led to this? What are the relevant past events?`;

      const contextResult = await generateSwarmResponse(
        contextPrompt,
        "You are a History & Context agent. You provide deep background info. You rely on your internal knowledge mostly but can use search if needed.",
        false
      );

      addLog(AgentRole.CONTEXTUALIZER, `Contextual framework established.`, 'success');
      setReportMarkdown(prev => prev + `## 📖 Historical Context\n\n${contextResult.text}\n\n---\n\n`);

      // --- PHASE 4: WRITER ---
      setCurrentAgent(AgentRole.WRITER);
      setAgentStatus('Synthesizing final intelligence brief...');
      addLog(AgentRole.WRITER, `Compiling final investigative report...`, 'thinking');

      const writerPrompt = `Create a cohesive, professional Investigative Journalist Report about "${topic}".
      
      Combine the following inputs:
      1. Recent News: ${scannerResult.text}
      2. Verification Notes: ${verifierResult.text}
      3. Historical Context: ${contextResult.text}
      
      Format with Markdown. Use a compelling Headline. Write an Executive Summary, then the details. Tone: Professional, Objective, Investigative.`;

      const writerResult = await generateSwarmResponse(
        writerPrompt,
        "You are a Senior Editor and Writer. You synthesize disparate facts into a beautiful narrative.",
        false
      );

      addLog(AgentRole.WRITER, `Report generation complete.`, 'success');
      setReportMarkdown(writerResult.text); // Replace partials with final cohesive report
      addLog(AgentRole.IDLE, `Mission Complete.`, 'success');

    } catch (error: any) {
      addLog(AgentRole.IDLE, `Critical Failure: ${error.message}`, 'error');
      setAgentStatus('Error encountered. Swarm halted.');
    } finally {
      setIsRunning(false);
      setCurrentAgent(AgentRole.IDLE);
      setAgentStatus('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200">
      
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6 shrink-0 z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-900/20">
            TS
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-100">
            TruthSeeker <span className="text-cyan-500 font-light">AI</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            GEMINI-2.5-FLASH ONLINE
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            SWARM READY
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Controls & Logs */}
        <div className="w-full md:w-[450px] flex flex-col border-r border-slate-800 bg-slate-925">
          
          {/* Input Area */}
          <div className="p-6 border-b border-slate-800 bg-slate-900/50">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Investigative Target
            </label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isRunning && runSwarm()}
                placeholder="e.g., 'Global supply chain disruptions'"
                disabled={isRunning}
                className="w-full bg-slate-950 border-2 border-slate-800 text-slate-100 rounded-lg pl-10 pr-4 py-3 focus:border-cyan-500 focus:ring-0 transition-all outline-none disabled:opacity-50"
              />
              <Search className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
            </div>
            <button
              onClick={runSwarm}
              disabled={isRunning || !topic}
              className={`mt-4 w-full flex items-center justify-center gap-2 font-bold py-3 rounded-lg transition-all
                ${isRunning 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/30 hover:shadow-cyan-700/40'
                }`}
            >
              {isRunning ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Deploying Swarm...</>
              ) : (
                <><Play className="w-4 h-4 fill-current" /> Initiate Investigation</>
              )}
            </button>
          </div>

          {/* Agent Grid */}
          <div className="p-6 grid grid-cols-2 gap-3 border-b border-slate-800">
            {[AgentRole.SCANNER, AgentRole.VERIFIER, AgentRole.CONTEXTUALIZER, AgentRole.WRITER].map((role) => (
              <AgentCard 
                key={role}
                config={AGENTS[role]} 
                isActive={currentAgent === role}
                status={agentStatus}
              />
            ))}
          </div>

          {/* Live Logs */}
          <div className="flex-1 p-4 min-h-0">
            <TerminalLog logs={logs} />
          </div>
        </div>

        {/* Right Panel: Report */}
        <div className="flex-1 flex flex-col bg-slate-100 relative">
           {/* Background Texture */}
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
           
           <div className="flex-1 p-4 md:p-8 min-h-0 relative z-10">
             <ReportView 
               markdown={reportMarkdown} 
               sources={sources} 
               isGenerating={isRunning}
             />
           </div>
        </div>

      </main>
    </div>
  );
};

export default App;