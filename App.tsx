import React, { useState } from 'react';
import { CredentialsForm } from './components/CredentialsForm';
import { Dashboard } from './components/Dashboard';
import { GrowthLab } from './components/GrowthLab';
import { FixCenter } from './components/FixCenter';
import { SearchTest } from './components/SearchTest';
import { TwitterCredentials, AnalysisResult, EngagementMetrics } from './types';
import { getMockTwitterData } from './services/mockData';
import { analysisService } from './services/analysisService';
import { Terminal, BarChart2, Info, RefreshCw, Zap, Wrench, LayoutDashboard, Search } from 'lucide-react';

type Tab = 'overview' | 'growth' | 'fix' | 'search';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<TwitterCredentials | null>(null);
  const [username, setUsername] = useState<string>('');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  // Data State
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleLogin = async (creds: TwitterCredentials, user: string) => {
    setCredentials(creds);
    setUsername(user);
    setIsLoading(true);
    
    try {
      // 1. Ingestion Phase (Simulated for this demo)
      const data = await getMockTwitterData();
      setMetrics(data);

      // 2. Intelligence Phase (Using Gemini)
      const result = await analysisService.analyzeAccount(data);
      setAnalysis(result);
      
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed", error);
      alert("Failed to scan account. Please check credentials or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRescan = async () => {
     if (!metrics) return;
     setIsLoading(true);
     try {
        const data = await getMockTwitterData();
        setMetrics(data);
        const result = await analysisService.analyzeAccount(data);
        setAnalysis(result);
     } catch(e) {
       console.error(e);
     } finally {
       setIsLoading(false);
     }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">X Visibility Diagnostics</span>
          </div>
          {isAuthenticated && (
            <div className="flex items-center gap-4">
               <button 
                 onClick={handleRescan}
                 disabled={isLoading}
                 className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
               >
                 <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                 Rescan
               </button>
               <div className="h-6 w-px bg-slate-800"></div>
               <button 
                 onClick={() => setIsAuthenticated(false)}
                 className="text-sm text-slate-400 hover:text-white"
               >
                 Disconnect
               </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAuthenticated ? (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center mt-20 gap-4">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <h3 className="text-xl font-medium text-white">Scanning Account Health...</h3>
                  <p className="text-slate-400 max-w-md text-center">
                    Fetching tweets, analyzing reply chains, and checking for shadowban signatures via Gemini 2.5...
                  </p>
                </div>
              ) : (
                <CredentialsForm onSubmit={handleLogin} />
              )}
           </div>
        ) : (
          <>
             {/* Tabs */}
             <div className="flex justify-center mb-8">
               <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex gap-1 overflow-x-auto max-w-full">
                 <button
                   onClick={() => setActiveTab('overview')}
                   className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                     activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                   }`}
                 >
                   <LayoutDashboard className="w-4 h-4" /> Overview
                 </button>
                 <button
                   onClick={() => setActiveTab('search')}
                   className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                     activeTab === 'search' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                   }`}
                 >
                   <Search className="w-4 h-4" /> Search Test
                 </button>
                 <button
                   onClick={() => setActiveTab('growth')}
                   className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                     activeTab === 'growth' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                   }`}
                 >
                   <Zap className="w-4 h-4" /> Growth Lab
                 </button>
                 <button
                   onClick={() => setActiveTab('fix')}
                   className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                     activeTab === 'fix' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                   }`}
                 >
                   <Wrench className="w-4 h-4" /> Fix Center
                   {analysis && analysis.flags.length > 0 && (
                     <span className="ml-1 px-1.5 py-0.5 bg-slate-950/30 rounded-full text-[10px]">{analysis.flags.length}</span>
                   )}
                 </button>
               </div>
             </div>

             {/* Views */}
             <div className="min-h-[600px]">
               {(metrics && analysis) && (
                 <>
                   {activeTab === 'overview' && (
                     <Dashboard metrics={metrics} analysis={analysis} username={username} />
                   )}
                   {activeTab === 'search' && (
                     <SearchTest />
                   )}
                   {activeTab === 'growth' && (
                     <GrowthLab ideas={analysis.contentIdeas || []} />
                   )}
                   {activeTab === 'fix' && (
                     <FixCenter flags={analysis.flags} />
                   )}
                 </>
               )}
             </div>
          </>
        )}
      </main>

      {/* Footer Info */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950/90 backdrop-blur px-6 py-3">
         <div className="max-w-7xl mx-auto flex justify-between items-center text-xs text-slate-500">
           <div className="flex items-center gap-2">
             <Terminal className="w-3 h-3" />
             <span>Local-First Architecture</span>
             <span className="mx-1">•</span>
             <span>v1.2.0 (Pro)</span>
           </div>
           <div className="flex items-center gap-2">
             <Info className="w-3 h-3" />
             <span>Powered by Google Gemini 2.5 Flash</span>
           </div>
         </div>
      </footer>
    </div>
  );
}

export default App;