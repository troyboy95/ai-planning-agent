import { gemini, AgentError } from '../gemini';
import { safeParseJSON } from '../utils';
import { EDITOR_SYSTEM_PROMPT } from '../prompts';

export async function runEditorAgent(
  sectionId: string,
  currentContent: string,
  editInstruction: string,
  reportContext: string
): Promise<any> {
  try {
    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Report Context: ${reportContext}
          
Section ID being edited: ${sectionId}
          
User Instruction: <instruction>${editInstruction}</instruction>

Current Content (JSON format):
<current_content>
${currentContent}
</current_content>

Please return ONLY the updated JSON for this section's content.`,
      config: {
        systemInstruction: EDITOR_SYSTEM_PROMPT,
      }
    });

    const raw = response.text;
    if (!raw) {
       throw new AgentError('editor', 'Received empty response from AI');
    }

    const parsed = safeParseJSON<any>(raw);
    
    if (!parsed) {
      throw new AgentError('editor', 'Invalid JSON response from AI');
    }
    
    return parsed;
  } catch (error) {
    if (error instanceof AgentError) throw error;
    throw new AgentError('editor', error instanceof Error ? error.message : 'Unknown error occurred in Editor agent');
  }
}
