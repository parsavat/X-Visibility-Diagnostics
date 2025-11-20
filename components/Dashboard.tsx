import React from 'react';
import { AnalysisResult, EngagementMetrics, VisibilityStatus } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend 
} from 'recharts';
import { AlertTriangle, CheckCircle, ShieldAlert, Activity, Calendar, ArrowUpRight } from 'lucide-react';

interface DashboardProps {
  metrics: EngagementMetrics;
  analysis: AnalysisResult;
  username: string;
}

const StatusBadge = ({ status }: { status: VisibilityStatus }) => {
  const colors = {
    [VisibilityStatus.HEALTHY]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    [VisibilityStatus.AT_RISK]: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    [VisibilityStatus.SHADOWBANNED]: 'bg-red-500/10 text-red-400 border-red-500/20',
    [VisibilityStatus.RESTRICTED]: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const MetricCard = ({ label, value, trend, subtext }: { label: string; value: string; trend?: number; subtext?: string }) => (
  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
    <div className="text-slate-400 text-sm mb-1">{label}</div>
    <div className="text-2xl font-bold text-slate-100">{value}</div>
    {(trend !== undefined) && (
      <div className={`text-xs mt-2 flex items-center ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {trend >= 0 ? '+' : ''}{trend}%
        <span className="text-slate-500 ml-2">vs previous 28d</span>
      </div>
    )}
    {subtext && <div className="text-xs text-slate-500 mt-2">{subtext}</div>}
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ metrics, analysis, username }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <img 
              src={`https://picsum.photos/seed/${username}/48/48`} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-slate-700"
            />
            @{username} Analysis
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Last scan: {new Date().toLocaleDateString()} • {metrics.totalFollowers.toLocaleString()} Followers
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
             <div className="text-xs text-slate-400 uppercase tracking-wider">Health Score</div>
             <div className={`text-3xl font-black ${analysis.healthScore > 80 ? 'text-emerald-400' : analysis.healthScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
               {analysis.healthScore}/100
             </div>
           </div>
           <StatusBadge status={analysis.status} />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          label="Avg Engagement Rate" 
          value={`${metrics.averageEngagementRate.toFixed(2)}%`}
          trend={-2.5} 
        />
        <MetricCard 
          label="Impressions (28d)" 
          value={metrics.currentPeriod.reduce((a, b) => a + b.impressions, 0).toLocaleString()}
          trend={12.4}
        />
        <MetricCard 
          label="Reply Ratio" 
          value={metrics.replyRatio.toFixed(1)} 
          subtext="Avg replies per day"
        />
        <MetricCard 
          label="Shadowban Probability" 
          value={analysis.status === VisibilityStatus.SHADOWBANNED ? "High" : "Low"}
          subtext="Based on visibility checks"
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Impressions Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Visibility Trends
            </h3>
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1 text-slate-400"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Impressions</span>
              <span className="flex items-center gap-1 text-slate-400"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Engagements</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.currentPeriod}>
                <defs>
                  <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="impressions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorImp)" />
                <Area type="monotone" dataKey="engagements" stroke="#10b981" fillOpacity={1} fill="url(#colorEng)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Risk Assessment */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
           <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-yellow-400" />
              Detected Flags
           </h3>
           <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
             {analysis.flags.length === 0 ? (
                <div className="text-emerald-400 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> No active risks detected.
                </div>
             ) : (
               analysis.flags.map((flag, idx) => (
                 <div key={idx} className={`p-3 rounded-lg border ${
                    flag.severity === 'critical' ? 'bg-red-900/20 border-red-900/50' :
                    flag.severity === 'warning' ? 'bg-yellow-900/20 border-yellow-900/50' :
                    'bg-blue-900/20 border-blue-900/50'
                 }`}>
                   <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-bold uppercase ${
                        flag.severity === 'critical' ? 'text-red-400' :
                        flag.severity === 'warning' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`}>{flag.severity}</span>
                      <span className="text-[10px] text-slate-500">{new Date(flag.timestamp).toLocaleTimeString()}</span>
                   </div>
                   <h4 className="text-sm font-medium text-slate-200">{flag.title}</h4>
                   <p className="text-xs text-slate-400 mt-1 leading-relaxed">{flag.description}</p>
                 </div>
               ))
             )}
           </div>
        </div>
      </div>

      {/* Bottom: Strategy & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Action Plan */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
           <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <ArrowUpRight className="w-4 h-4 text-purple-400" />
              Recommended 30-Day Recovery
           </h3>
           <div className="space-y-4">
             {analysis.actionPlan.map((item, idx) => (
               <div key={idx} className="flex items-start gap-3 group">
                 <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-400 shrink-0 group-hover:border-purple-500/50 transition-colors">
                   {idx + 1}
                 </div>
                 <div>
                   <div className="flex items-center gap-2 mb-1">
                     <span className="text-sm font-medium text-slate-200">{item.action}</span>
                     <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                       item.impact === 'High' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                     }`}>{item.impact} Impact</span>
                   </div>
                   <div className="text-xs text-slate-500">{item.day}</div>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Content Strategy */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-pink-400" />
            Optimization Strategy
          </h3>
          
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Best Posting Windows</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.postingStrategy.bestTimes.map((time, i) => (
                <div key={i} className="px-3 py-1.5 bg-slate-800 rounded-md border border-slate-700 text-sm text-slate-300">
                  {time}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Suggested Content Mix</h4>
            <div className="p-3 bg-slate-800/50 border border-slate-800 rounded-lg text-sm text-slate-300 leading-relaxed">
              {analysis.postingStrategy.contentMix}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};