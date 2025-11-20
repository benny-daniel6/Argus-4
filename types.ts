export enum AgentRole {
  SCANNER = 'SCANNER',
  VERIFIER = 'VERIFIER',
  CONTEXTUALIZER = 'CONTEXTUALIZER',
  WRITER = 'WRITER',
  IDLE = 'IDLE'
}

export interface AgentConfig {
  id: AgentRole;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  agent: AgentRole;
  message: string;
  type: 'info' | 'success' | 'error' | 'thinking';
}

export interface Source {
  title: string;
  uri: string;
}

export interface ReportData {
  topic: string;
  headlines: string[];
  verifiedFacts: string[];
  historicalContext: string;
  finalReport: string;
  sources: Source[];
}
