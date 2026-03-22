import { useState } from 'react';
import { ReportSection, ProblemBreakdown, Stakeholder, SolutionApproach, ActionPlanItem } from '@/types/report';
import { Pencil, Clock, Check, X, Wand2, History } from 'lucide-react';
import { authenticatedFetch } from '@/lib/apiClient';

const QUICK_ACTIONS = [
  "Make more detailed",
  "Rewrite professionally",
  "Shorten this",
  "Make actionable"
];

export function SectionCard({
  section,
  index,
  reportContext,
  reportId,
  onUpdate,
  onRestore
}: {
  section: ReportSection,
  index: number,
  reportContext: string,
  reportId: string,
  onUpdate: (content: any, rawText: string) => void,
  onRestore: (versionRaw: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editInstruction, setEditInstruction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [draftContent, setDraftContent] = useState<any>(null);
  const [draftRaw, setDraftRaw] = useState('');
  const [editError, setEditError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Apply an edit via AI
  const handleApplyEdit = async (instruction: string) => {
    if (!instruction.trim()) {
      setEditError('Please provide an instruction.');
      return;
    }
    setEditInstruction(instruction); // in case triggered by quick chip
    setIsProcessing(true);
    setEditError('');
    setDraftContent(null);

    try {
      const res = await authenticatedFetch('/api/agent/edit-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: section.id,
          currentContent: section.rawText,
          editInstruction: instruction,
          reportContext,
          reportId
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to edit section');
      }

      const { data } = await res.json();
      setDraftRaw(data.updatedContent);
      setDraftContent(JSON.parse(data.updatedContent));
    } catch (e) {
      setEditError((e as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmEdit = () => {
    if (draftContent && draftRaw) {
      onUpdate(draftContent, draftRaw);
      setIsEditing(false);
      setDraftContent(null);
      setDraftRaw('');
      setEditInstruction('');
      setShowHistory(false);
    }
  };

  const handleDiscardEdit = () => {
    setDraftContent(null);
    setDraftRaw('');
    setIsEditing(false);
    setEditError('');
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm relative overflow-hidden transition-all duration-300">

      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold leading-none">
            {index}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {section.versions && section.versions.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${showHistory ? 'bg-indigo-100 text-primary' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <History className="w-4 h-4" /> History
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            disabled={isProcessing}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isEditing ? 'bg-primary text-white' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
          >
            <Pencil className="w-4 h-4" /> Edit with AI
          </button>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && section.versions && section.versions.length > 0 && !isEditing && (
        <div className="bg-indigo-50 border-b p-4 px-6 text-sm">
          <h4 className="font-semibold text-primary mb-3">Version History</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {section.versions.map((v, i) => (
              <div key={i} className="flex items-center justify-between bg-white border p-2 rounded">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Version {section.versions.length - i}</span>
                </div>
                <button
                  onClick={() => onRestore(v)}
                  className="text-primary hover:underline font-medium"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor Panel */}
      {isEditing && (
        <div className="bg-[#1E1E3F]/5 border-b p-6 space-y-4 animate-fade-in relative">

          {!draftContent ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">How would you like to edit this section?</label>
                <div className="flex gap-2 mb-3 mt-2 flex-wrap">
                  {QUICK_ACTIONS.map(action => (
                    <button
                      key={action}
                      onClick={() => handleApplyEdit(action)}
                      className="text-xs bg-white border border-gray-200 hover:border-primary hover:text-primary px-3 py-1.5 rounded-full transition-colors font-medium text-gray-600"
                    >
                      {action}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editInstruction}
                    onChange={e => setEditInstruction(e.target.value)}
                    placeholder="e.g. Add a new stakeholder for marketing..."
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleApplyEdit(editInstruction);
                    }}
                  />
                  <button
                    onClick={() => handleApplyEdit(editInstruction)}
                    disabled={isProcessing || !editInstruction.trim()}
                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isProcessing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Wand2 className="w-4 h-4" />}
                    Apply
                  </button>
                </div>
              </div>

              {editError && (
                <div className="text-red-500 text-sm mt-2">{editError}</div>
              )}
            </>
          ) : (
            <div className="bg-white border rounded-lg p-5 shadow-sm space-y-4">
              <div>
                <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Draft Preview</div>
                <div className="text-sm text-gray-600 mb-4 pb-4 border-b">
                  Review the changes made by the AI. If accepted, the old version will be saved in history.
                </div>

                {/* Render Draft */}
                <div className="opacity-90 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar border-l-4 border-green-400 pl-4 py-2 bg-green-50/30">
                  <RenderSectionContent id={section.id} content={draftContent} />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  onClick={handleDiscardEdit}
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                >
                  <X className="w-4 h-4" /> Discard
                </button>
                <button
                  onClick={handleConfirmEdit}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium flex items-center gap-2 hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4" /> Confirm Changes
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Content Rendering */}
      <div className={`p-6 md:p-8 ${isEditing && draftContent ? 'opacity-40 grayscale blur-[1px]' : ''} transition-all duration-300`}>
        <RenderSectionContent id={section.id} content={section.content} />
      </div>

    </div>
  );
}

// Sub-component to route rendering based on section ID
function RenderSectionContent({ id, content }: { id: string, content: any }) {
  if (!content) return <div className="text-gray-400 italic">Content is empty or malformed.</div>;

  switch (id) {
    case 'problem-breakdown': {
      const data = content as ProblemBreakdown;
      return (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed text-[15px]">{data.summary}</p>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Core Components</h3>
            <ul className="space-y-3">
              {data.components.map((c, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                  <div>
                    <span className="font-semibold text-gray-900">{c.title}:</span>{" "}
                    <span className="text-gray-600">{c.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
            <h3 className="text-[15px] font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <span className="text-amber-500">⚠</span> Constraints
            </h3>
            <ul className="list-disc pl-5 text-amber-800 space-y-1 text-[15px]">
              {data.constraints.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        </div>
      );
    }

    case 'stakeholders': {
      const data = content as Stakeholder[];
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Stakeholder</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Role</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 w-1/2">Key Concern</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Influence</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                  <td className="py-3 px-4 text-[15px] font-medium text-gray-900">{s.name}</td>
                  <td className="py-3 px-4 text-[15px] text-gray-600">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                      {s.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[15px] text-gray-600">{s.concern}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider
                      ${s.influence === 'high' ? 'text-red-600' : s.influence === 'medium' ? 'text-amber-600' : 'text-green-600'}
                    `}>
                      <span className={`w-2 h-2 rounded-full ${s.influence === 'high' ? 'bg-red-500' : s.influence === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                      {s.influence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'solution-approach': {
      const data = content as SolutionApproach;
      return (
        <div className="space-y-8">
          <p className="text-gray-700 leading-relaxed text-[15px]">{data.overview}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.strategies.map((s, i) => (
              <div key={i} className="border rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <h3 className="font-bold text-gray-900">{s.title}</h3>
                </div>
                <p className="text-[15px] text-gray-600 mb-4">{s.description}</p>
                <div className="text-sm bg-gray-50 p-3 rounded text-gray-500 border border-gray-100">
                  <span className="font-semibold text-gray-700">Rationale:</span> {s.rationale}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-gray-400">⚡</span> Trade-offs & Considerations
            </h3>
            <ul className="space-y-2">
              {data.tradeoffs.map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] text-gray-600">
                  <span className="mt-1 text-gray-400">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    case 'action-plan': {
      const data = content as ActionPlanItem[];
      return (
        <div className="relative pl-4 border-l-2 border-primary/20 space-y-8 py-2">
          {data.map((phase, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-primary border-4 border-white"></div>

              <div className="mb-1 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-gray-900">{phase.phase}</h3>
                <div className="flex items-center gap-3 text-sm">
                  <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {phase.timeline}
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded font-medium">
                    Owner: {phase.owner}
                  </span>
                </div>
              </div>

              <div className="text-sm text-green-600 font-medium mb-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Success: {phase.successMetric}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border">
                <ul className="space-y-2.5">
                  {phase.actions.map((action, j) => (
                    <li key={j} className="flex items-start gap-3 group">
                      <div className="w-5 h-5 rounded border bg-white flex items-center justify-center mt-0.5 text-gray-300 group-hover:border-primary/50 transition-colors">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-[15px] text-gray-700 leading-relaxed">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      );
    }

    default:
      return <div className="text-gray-400">Unknown section type "{id}"</div>;
  }
}
