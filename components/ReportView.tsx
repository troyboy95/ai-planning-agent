import { Report, ProblemBreakdown, Stakeholder, SolutionApproach, ActionPlanItem } from '@/types/report';
import { SectionCard } from './SectionCard';
import { AgentTrace } from './AgentTrace';

export function ReportView({ report, onUpdate }: { report: Report, onUpdate: (r: Report) => void }) {

  const handleSectionUpdate = (sectionId: string, newContent: any, newRawText: string) => {
    const updated = { ...report };
    const idx = updated.sections.findIndex(s => s.id === sectionId);
    if (idx !== -1) {
      const oldRaw = updated.sections[idx].rawText;
      updated.sections[idx] = {
        ...updated.sections[idx],
        content: newContent,
        rawText: newRawText,
        versions: [oldRaw, ...updated.sections[idx].versions],
        lastEditedAt: new Date().toISOString()
      };
      onUpdate(updated);
    }
  };

  const handleRestoreVersion = (sectionId: string, versionRawText: string) => {
    // A simple restore just pushes the current state to versions and adopts the versionRawText
    const updated = { ...report };
    const idx = updated.sections.findIndex(s => s.id === sectionId);
    if (idx !== -1) {
      const currentRaw = updated.sections[idx].rawText;
      updated.sections[idx] = {
        ...updated.sections[idx],
        content: JSON.parse(versionRawText),
        rawText: versionRawText,
        versions: [currentRaw, ...updated.sections[idx].versions.filter(v => v !== versionRawText)],
        lastEditedAt: new Date().toISOString()
      };
      onUpdate(updated);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">

      <div className="border-b pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">{report.problemStatement}</h1>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <span>Generated {new Date(report.createdAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-8">
        {report.sections.map((section, idx) => (
          <div key={section.id} id={section.id} className="scroll-mt-20">
            <SectionCard
              section={section}
              index={idx + 1}
              reportContext={report.problemStatement}
              reportId={report.id}
              onUpdate={(newContent, newRaw) => handleSectionUpdate(section.id, newContent, newRaw)}
              onRestore={(v) => handleRestoreVersion(section.id, v)}
            />
          </div>
        ))}
      </div>

      <div className="pt-16">
        <AgentTrace
          plannerTrace={report.agentTrace?.plannerOutput?.rawPlannerThinking}
          insightTrace={report.agentTrace?.insightOutput?.rawInsightThinking}
        />
      </div>

    </div>
  );
}
