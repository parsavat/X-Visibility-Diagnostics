import React, { useState } from 'react';
import { Sparkles, Zap, Copy, ArrowRight, PenTool } from 'lucide-react';
import { ContentIdea, TweetVariation } from '../types';
import { analysisService } from '../services/analysisService';

interface Props {
  ideas: ContentIdea[];
}

export const GrowthLab: React.FC<Props> = ({ ideas }) => {
  const [draft, setDraft] = useState('');
  const [variations, setVariations] = useState<TweetVariation[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    if (!draft.trim()) return;
    setIsOptimizing(true);
    const result = await analysisService.optimizeDraft(draft);
    setVariations(result);
    setIsOptimizing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
      
      {/* Tool 1: Content Ideas */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <div>
             <h3 className="text-lg font-bold text-white">High-Potential Topics</h3>
             <p className="text-xs text-slate-400">AI-curated themes based on your niche performance</p>
          </div>
        </div>

        <div className="space-y-4">
          {ideas.map((idea, idx) => (
            <div key={idx} className="p-4 border border-slate-800 rounded-lg hover:bg-slate-800/30 transition-all group cursor-pointer">
               <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{idea.format}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    idea.estimatedReach === 'High' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {idea.estimatedReach} Impact
                  </span>
               </div>
               <h4 className="text-sm font-semibold text-slate-200 mb-1">{idea.topic}</h4>
               <p className="text-xs text-slate-400 italic">"{idea.hook}"</p>
               
               <div className="mt-3 pt-3 border-t border-slate-800 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                    onClick={() => setDraft(idea.hook + " ...")}
                    className="text-xs flex items-center gap-1 text-slate-300 hover:text-white"
                 >
                   Use as draft <ArrowRight className="w-3 h-3" />
                 </button>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tool 2: Viral Optimizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
             <h3 className="text-lg font-bold text-white">Viral Post Refiner</h3>
             <p className="text-xs text-slate-400">Rewrite drafts for maximum engagement</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
             <textarea
               value={draft}
               onChange={(e) => setDraft(e.target.value)}
               className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none placeholder:text-slate-600"
               placeholder="Paste your draft tweet here..."
             />
             <div className="absolute bottom-3 right-3">
               <button 
                 onClick={handleOptimize}
                 disabled={isOptimizing || !draft}
                 className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 {isOptimizing ? (
                   <>Thinking <Sparkles className="w-3 h-3 animate-pulse" /></>
                 ) : (
                   <>Optimize <Sparkles className="w-3 h-3" /></>
                 )}
               </button>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
          {variations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 opacity-50">
               <PenTool className="w-8 h-8" />
               <p className="text-sm">Draft a tweet to see AI variations</p>
            </div>
          ) : (
            variations.map((v, i) => (
              <div key={i} className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-bold text-blue-400">{v.style}</span>
                   <button 
                     onClick={() => copyToClipboard(v.text)}
                     className="text-slate-500 hover:text-white transition-colors"
                     title="Copy"
                   >
                     <Copy className="w-3 h-3" />
                   </button>
                 </div>
                 <p className="text-sm text-slate-300 whitespace-pre-wrap mb-2">{v.text}</p>
                 <p className="text-[10px] text-slate-500 border-t border-slate-800 pt-2">
                   Why: {v.reasoning}
                 </p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};