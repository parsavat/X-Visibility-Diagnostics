import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Key, ShieldCheck } from 'lucide-react';
import { TwitterCredentials } from '../types';

interface Props {
  onSubmit: (creds: TwitterCredentials, username: string) => void;
}

export const CredentialsForm: React.FC<Props> = ({ onSubmit }) => {
  const [showSecrets, setShowSecrets] = useState(false);
  const [username, setUsername] = useState('');
  const [formData, setFormData] = useState<TwitterCredentials>({
    apiKey: '',
    apiSecret: '',
    bearerToken: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, username);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
          <ShieldCheck className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Connect Account</h2>
        <p className="text-slate-400 text-sm mt-2">
          Credentials are processed locally. We do not store your keys.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
           <label className="block text-xs font-medium text-slate-500 uppercase mb-1">X Handle (Username)</label>
           <div className="relative">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">@</span>
             <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-8 pr-4 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-700"
                placeholder="elonmusk"
             />
           </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 bg-slate-900 text-xs text-slate-500">API V2 Credentials</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase mb-1">API Key</label>
          <div className="relative">
            <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input 
              type="text" 
              required
              value={formData.apiKey}
              onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm placeholder:text-slate-700"
              placeholder="Enter API Key"
            />
          </div>
        </div>

        <div>
           <label className="block text-xs font-medium text-slate-500 uppercase mb-1">API Secret</label>
           <div className="relative">
             <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
             <input 
               type={showSecrets ? "text" : "password"}
               required
               value={formData.apiSecret}
               onChange={(e) => setFormData({...formData, apiSecret: e.target.value})}
               className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-10 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm placeholder:text-slate-700"
               placeholder="Enter API Secret"
             />
             <button 
               type="button"
               onClick={() => setShowSecrets(!showSecrets)}
               className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
             >
               {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
             </button>
           </div>
        </div>

        <div>
           <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Bearer Token</label>
           <div className="relative">
             <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
             <input 
               type={showSecrets ? "text" : "password"}
               required
               value={formData.bearerToken}
               onChange={(e) => setFormData({...formData, bearerToken: e.target.value})}
               className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-10 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm placeholder:text-slate-700"
               placeholder="Enter Bearer Token"
             />
           </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
        >
          Start Diagnostics Scan
        </button>
      </form>
    </div>
  );
};