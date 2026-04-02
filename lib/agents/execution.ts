import { gemini, AgentError } from '../gemini';
import { safeParseJSON } from '../utils';
import { EXECUTION_SYSTEM_PROMPT } from '../prompts';
import { InsightOutput, PlannerOutput, ReportSection } from '@/types/report';

interface RawExecutionOutput {
  sections: ReportSection[];
}

export async function runExecutionAgent(
  problemStatement: string, 
  plannerOutput: PlannerOutput, 
  insightOutput: InsightOutput
): Promise<RawExecutionOutput> {
  try {
    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Original problem statement:\n<user_problem>${problemStatement}</user_problem>
          
Planner decomposition:
<planner_output>
${JSON.stringify(plannerOutput, null, 2)}
</planner_output>

Insight enrichment:
<insight_output>
${JSON.stringify(insightOutput, null, 2)}
</insight_output>

Generate the final structured report matching the requested JSON schema.`,
      config: {
        systemInstruction: EXECUTION_SYSTEM_PROMPT,
      }
    });

    const raw = response.text;
    if (!raw) {
       throw new AgentError('execution', 'Received empty response from AI');
    }

    const parsed = safeParseJSON<RawExecutionOutput>(raw);
    
    if (!parsed || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
      throw new AgentError('execution', 'Invalid or empty sections in AI response');
    }
    
    return parsed;
  } catch (error) {
    if (error instanceof AgentError) throw error;
    throw new AgentError('execution', error instanceof Error ? error.message : 'Unknown error occurred in Execution agent');
  }
}
