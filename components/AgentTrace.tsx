import { useState } from 'react';
import { ChevronDown, ChevronUp, History, TerminalSquare } from 'lucide-react';

export function AgentTrace({ plannerTrace, insightTrace }: { plannerTrace?: string, insightTrace?: string }) {
  const [open, setOpen] = useState(false);

  if (!plannerTrace && !insightTrace) return null;

  return (
    <div className="border rounded-md overflow-hidden bg-gray-50">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <span className="flex items-center gap-2"><TerminalSquare className="w-4 h-4" /> Agent Reasoning Trace</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <div className="p-4 border-t text-xs font-mono text-gray-500 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
          {plannerTrace && (
            <div className="mb-4">
              <span className="text-indigo-500 font-bold block mb-1"># Planner Logic</span>
              {plannerTrace}
            </div>
          )}
          {insightTrace && (
            <div>
              <span className="text-teal-600 font-bold block mb-1"># Insight Logic</span>
              {insightTrace}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
