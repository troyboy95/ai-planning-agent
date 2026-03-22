export interface ProblemBreakdown {
  summary: string;
  components: { title: string; description: string }[];
  constraints: string[];
}

export interface Stakeholder {
  name: string;
  role: string;
  concern: string;
  influence: 'high' | 'medium' | 'low';
}

export interface SolutionApproach {
  overview: string;
  strategies: { title: string; description: string; rationale: string }[];
  tradeoffs: string[];
}

export interface ActionPlanItem {
  phase: string;
  actions: string[];
  timeline: string;
  owner: string;
  successMetric: string;
}

export interface ReportSection {
  id: string;                  // e.g. 'problem-breakdown'
  title: string;
  content: ProblemBreakdown | Stakeholder[] | SolutionApproach | ActionPlanItem[];
  rawText: string;             // serialised text version for editing
  versions: string[];          // version history of rawText (bonus feature)
  lastEditedAt?: string;
}

export interface PlannerOutput {
  components: string[];
  constraints: string[];
  scope: string;
  rawPlannerThinking: string;
}

export interface InsightOutput {
  stakeholders: Stakeholder[];
  enrichedComponents: { component: string; insight: string; risks: string[] }[];
  keyThemes: string[];
  rawInsightThinking: string;
}

export interface ReportPayload {
  report: Report;
}

export interface Report {
  id: string;
  problemStatement: string;
  createdAt: string;
  sections: ReportSection[];
  agentTrace: {
    plannerOutput: PlannerOutput;
    insightOutput: InsightOutput;
  };
  userId?: string;
  updatedAt?: string;
}
