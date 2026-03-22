import { gemini, AgentError } from '../gemini';
import { safeParseJSON } from '../utils';
import { PLANNER_SYSTEM_PROMPT } from '../prompts';
import { PlannerOutput } from '@/types/report';

export async function runPlannerAgent(problemStatement: string): Promise<PlannerOutput> {
  try {
    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Here is the problem statement to decompose:\n<user_problem>${problemStatement}</user_problem>`,
      config: {
        systemInstruction: PLANNER_SYSTEM_PROMPT,
      }
    });

    const raw = response.text;
    if (!raw) {
       throw new AgentError('planner', 'Received empty response from AI');
    }

    const parsed = safeParseJSON<PlannerOutput>(raw);
    
    if (!parsed) {
      throw new AgentError('planner', 'Invalid JSON response from AI');
    }
    
    return parsed;
  } catch (error) {
    if (error instanceof AgentError) throw error;
    throw new AgentError('planner', error instanceof Error ? error.message : 'Unknown error occurred in Planner agent');
  }
}
