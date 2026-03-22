import { gemini, AgentError } from '../gemini';
import { safeParseJSON } from '../utils';
import { INSIGHT_SYSTEM_PROMPT } from '../prompts';
import { InsightOutput, PlannerOutput } from '@/types/report';

export async function runInsightAgent(problemStatement: string, plannerOutput: PlannerOutput): Promise<InsightOutput> {
  try {
    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Here is the original problem statement:\n<user_problem>${problemStatement}</user_problem>\n\nHere is the planner's decomposition:\n<planner_output>\n${JSON.stringify(plannerOutput, null, 2)}\n</planner_output>`,
      config: {
        systemInstruction: INSIGHT_SYSTEM_PROMPT,
      }
    });

    const raw = response.text;
    if (!raw) {
       throw new AgentError('insight', 'Received empty response from AI');
    }

    const parsed = safeParseJSON<InsightOutput>(raw);
    
    if (!parsed) {
      throw new AgentError('insight', 'Invalid JSON response from AI');
    }
    
    return parsed;
  } catch (error) {
    if (error instanceof AgentError) throw error;
    throw new AgentError('insight', error instanceof Error ? error.message : 'Unknown error occurred in Insight agent');
  }
}
