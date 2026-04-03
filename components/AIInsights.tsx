import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { getSamplingAdvice } from '../services/geminiService';
import { Mode } from '../types';

interface AIInsightsProps {
  mode: Mode;
  fieldsNeeded: number;
  goalAreaStr: string;
  fovAreaStr: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ mode, fieldsNeeded, goalAreaStr, fovAreaStr }) => {
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState<boolean>(false);

  const fetchAdvice = async () => {
    if (fieldsNeeded <= 0) return;
    
    setLoading(true);
    const result = await getSamplingAdvice(mode, fieldsNeeded, goalAreaStr, fovAreaStr);
    setAdvice(result);
    setLoading(false);
    setHasFetched(true);
  };

  // Reset if significant parameters change drastically (optional, currently manual trigger is safer)
  useEffect(() => {
    setHasFetched(false);
    setAdvice('');
  }, [mode]);

  return (
    <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
           <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Sparkles size={20} />
           </div>
           <h3 className="text-lg font-semibold text-indigo-900">AI Sampling Assistant</h3>
        </div>
        {!loading && (
          <button 
            onClick={fetchAdvice}
            className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 text-sm font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors shadow-sm"
          >
            {hasFetched ? <><RefreshCw size={14} /> Regenerate Advice</> : 'Get Advice'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-indigo-200/50 rounded w-3/4"></div>
          <div className="h-4 bg-indigo-200/50 rounded w-full"></div>
          <div className="h-4 bg-indigo-200/50 rounded w-5/6"></div>
        </div>
      ) : (
        <div className="prose prose-indigo max-w-none text-indigo-800/80 text-sm leading-relaxed">
          {advice ? (
            <p>{advice}</p>
          ) : (
            <p className="italic text-indigo-400">
              Click the button above to generate AI-powered insights regarding your sampling strategy based on the calculated field count.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AIInsights;
