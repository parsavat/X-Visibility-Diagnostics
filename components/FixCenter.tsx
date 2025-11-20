import React, { useState } from 'react';
import { RiskFlag, FixRecommendation } from '../types';
import { AlertTriangle, CheckCircle, Wrench, ChevronRight, Loader2 } from 'lucide-react';
import { analysisService } from '../services/analysisService';

interface Props {
  flags: RiskFlag[];
}

export const FixCenter: React.FC<Props> = ({ flags }) => {
  const [selectedFlag, setSelectedFlag] = useState<RiskFlag | null>(null);
  const [recommendation, setRecommendation] = useState<FixRecommendation | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectFlag = async (flag: RiskFlag) => {
    if (selectedFlag?.id === flag.id && recommendation) return; // Already showing
    
    setSelectedFlag(flag);
    setLoading(true);
    setRecommendation(null);
    
    const fix = await analysisService.getFixForFlag(flag);
    setRecommendation(fix);
    setLoading(false);
  };

  if (flags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-white">All Clear!</h3>
        <p className="text-slate-400">No account issues detected. Keep up the good work.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
      
      {/* List of Issues */}
      <div className="md:col-span-1 space-y-3">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Active Issues</h3>
        {flags.map((flag) => (
          <div 
            key={flag.id}
            onClick={() => handleSelectFlag(flag)}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedFlag?.id === flag.id 
                ? 'bg-slate-800 border-blue-500 ring-1 ring-blue-500' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded mb-2 inline-block ${
                 flag.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                 flag.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                 'bg-blue-500/20 text-blue-400'
              }`}>
                {flag.severity}
              </div>
            </div>
            <h4 className="text-sm font-semibold text-slate-200 mb-1">{flag.title}</h4>
            <p className="text-xs text-slate-500 line-clamp-2">{flag.description}</p>
            <div className="mt-3 flex items-center text-xs text-blue-400 font-medium">
              Resolve Issue <ChevronRight className="w-3 h-3 ml-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Remediation Panel */}
      <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-8 min-h-[400px]">
        {!selectedFlag ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
             <Wrench className="w-12 h-12 mb-4" />
             <p>Select an issue to generate a fix</p>
          </div>
        ) : loading ? (
          <div className="h-full flex flex-col items-center justify-center text-blue-400">
             <Loader2 className="w-8 h-8 animate-spin mb-4" />
             <p className="text-sm">Consulting Guidelines...</p>
          </div>
        ) : recommendation ? (
           <div className="animate-in slide-in-from-right-4 fade-in duration-300">
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-emerald-500/10 rounded-lg">
                 <Wrench className="w-5 h-5 text-emerald-400" />
               </div>
               <h2 className="text-xl font-bold text-white">{recommendation.title}</h2>
             </div>

             <div className="mb-8">
               <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Action Steps</h4>
               <div className="space-y-3">
                 {recommendation.steps.map((step, i) => (
                   <div key={i} className="flex gap-3">
                     <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold shrink-0 border border-slate-700">
                       {i + 1}
                     </div>
                     <p className="text-sm text-slate-300">{step}</p>
                   </div>
                 ))}
               </div>
             </div>

             {recommendation.template && (
               <div>
                 <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Suggested Tweet / Reply</h4>
                 <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 relative group">
                    <p className="text-sm text-slate-300 font-mono">{recommendation.template}</p>
                    <button 
                      onClick={() => navigator.clipboard.writeText(recommendation.template!)}
                      className="absolute top-2 right-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors"
                    >
                      Copy
                    </button>
                 </div>
                 <p className="text-xs text-slate-500 mt-2">
                   Use this template to signal normal activity to the algorithm or address the issue directly.
                 </p>
               </div>
             )}
           </div>
        ) : null}
      </div>

    </div>
  );
};