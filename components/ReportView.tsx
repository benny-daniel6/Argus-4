import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Source } from '../types';
import { ExternalLink, FileText, CheckCircle } from 'lucide-react';

interface ReportViewProps {
  markdown: string;
  sources: Source[];
  isGenerating: boolean;
}

const ReportView: React.FC<ReportViewProps> = ({ markdown, sources, isGenerating }) => {
  if (!markdown && !isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 border border-dashed border-slate-800 rounded-xl">
        <FileText className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">No report generated yet</p>
        <p className="text-sm">Initiate the swarm to begin investigation</p>
      </div>
    );
  }

  // Deduplicate sources by URI
  const uniqueSources: Source[] = Array.from(new Map(sources.map(s => [s.uri, s])).values());

  return (
    <div className="h-full flex flex-col bg-white text-slate-900 rounded-xl overflow-hidden shadow-xl">
      <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-cyan-700 mb-6 text-sm font-bold uppercase tracking-widest border-b border-cyan-100 pb-4">
            <CheckCircle className="w-4 h-4" />
            Confidential Report // Auto-Generated
          </div>
          
          <article className="prose prose-slate lg:prose-lg prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-cyan-600 hover:prose-a:text-cyan-800">
            <ReactMarkdown>{markdown}</ReactMarkdown>
            {isGenerating && (
               <div className="flex items-center gap-2 text-slate-400 mt-4">
                 <span className="animate-pulse">▋</span>
               </div>
            )}
          </article>

          {uniqueSources.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Verified Sources</h3>
              <div className="grid gap-2">
                {uniqueSources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-cyan-300 transition-colors group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="bg-slate-100 p-1.5 rounded-md group-hover:bg-cyan-50 transition-colors">
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 truncate group-hover:text-slate-900">
                        {source.title}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
                      {new URL(source.uri).hostname}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportView;