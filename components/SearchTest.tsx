
import React, { useState } from 'react';
import { Search, Globe, UserCheck, UserX, EyeOff, Activity, CheckCircle, XCircle, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { analysisService } from '../services/analysisService';
import { SearchTestResult, SearchQueryVariation } from '../types';

export const SearchTest: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchTestResult | null>(null);
  const [variations, setVariations] = useState<SearchQueryVariation[]>([]);
  const [isGeneratingVars, setIsGeneratingVars] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    setResult(null);
    try {
      const res = await analysisService.runSearchCheck(query);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVariations = async () => {
    if (!query.trim()) return;
    setIsGeneratingVars(true);
    try {
      const vars = await analysisService.generateSearchVariations(query);
      setVariations(vars);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingVars(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'VISIBLE': return 'text-emerald-400';
      case 'LIMITED_VISIBILITY': return 'text-yellow-400';
      case 'SEARCH_BANNED': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="text-center mb-8">
         <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
           <Search className="w-6 h-6 text-blue-400" />
           Search Visibility Diagnostics
         </h2>
         <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
           Enter a Tweet ID or unique text content to verify if it appears in search results across different contexts (Incognito, Non-followers, etc).
         </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 shadow-xl">
        <form onSubmit={handleSearch} className="relative">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Tweet ID or keywords (e.g., 'Launch Day #buildinpublic')"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading || !query}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? 'Testing...' : 'Run Test'}
            </button>
          </div>

          <div className="mt-4">
             <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Test Variations</span>
                <button 
                   type="button" 
                   onClick={handleGenerateVariations}
                   disabled={!query || isGeneratingVars}
                   className="text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors disabled:opacity-50"
                >
                   {isGeneratingVars ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                   {isGeneratingVars ? 'Generating...' : 'Suggest AI Variations'}
                </button>
             </div>
             
             <div className="flex flex-wrap gap-2">
               {variations.length > 0 ? (
                  variations.map((v, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setQuery(v.query)}
                      className="group relative text-xs bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/80 text-slate-300 px-3 py-2 rounded-full transition-all flex items-center gap-2 text-left"
                    >
                      <span className="font-bold text-slate-600 uppercase text-[10px] group-hover:text-blue-400 transition-colors">{v.type}</span>
                      <span className="max-w-[200px] truncate">{v.query}</span>
                    </button>
                  ))
               ) : (
                 <div className="w-full border border-dashed border-slate-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-600 italic">
                      {isGeneratingVars ? 'Analyzing keywords...' : 'Enter a query and click "Suggest AI Variations" to see test cases.'}
                    </p>
                 </div>
               )}
             </div>
          </div>
        </form>
        
        {isLoading && (
          <div className="mt-8 space-y-3 animate-pulse">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Probing global search nodes...</span>
              <span>35%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 animate-[shimmer_2s_infinite]" style={{ width: '40%' }}></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
               <div className="h-16 bg-slate-800/50 rounded-lg"></div>
               <div className="h-16 bg-slate-800/50 rounded-lg"></div>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* Main Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:col-span-1 flex flex-col items-center justify-center text-center">
               <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Visibility Score</div>
               <div className={`text-4xl font-black mb-2 ${result.score > 80 ? 'text-emerald-400' : result.score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                 {result.score}/100
               </div>
               <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  result.status === 'VISIBLE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                  result.status === 'LIMITED_VISIBILITY' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                  'bg-red-500/10 border-red-500/20 text-red-400'
               }`}>
                 {result.status.replace('_', ' ')}
               </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:col-span-2">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> AI Diagnosis
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {result.aiAnalysis}
              </p>
              <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-500">
                Timestamp: {new Date(result.timestamp).toLocaleString()} • Query: "{result.query}"
              </div>
            </div>
          </div>

          {/* Placement Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/30">
               <h3 className="font-semibold text-white flex items-center gap-2">
                 <Globe className="w-4 h-4 text-blue-400" />
                 Crawl Results
               </h3>
             </div>
             <div className="divide-y divide-slate-800">
               {result.placements.map((place, idx) => (
                 <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-800/20 transition-colors">
                   <div className="flex items-center gap-3">
                      {place.context.includes('Incognito') ? <EyeOff className="w-4 h-4 text-slate-500" /> : 
                       place.context.includes('Follower') ? <UserCheck className="w-4 h-4 text-slate-500" /> :
                       <UserX className="w-4 h-4 text-slate-500" />}
                      <span className="text-sm text-slate-300">{place.context}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     {place.found ? (
                       <>
                         <span className="text-xs font-medium text-emerald-400">Visible</span>
                         <CheckCircle className="w-4 h-4 text-emerald-500" />
                       </>
                     ) : (
                       <>
                         <span className="text-xs font-medium text-red-400">Not Found</span>
                         <XCircle className="w-4 h-4 text-red-500" />
                       </>
                     )}
                   </div>
                 </div>
               ))}
             </div>
          </div>

        </div>
      )}
    </div>
  );
};
