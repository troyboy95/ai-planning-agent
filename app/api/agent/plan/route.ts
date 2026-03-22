import { NextResponse } from 'next/server';
import { runPlannerAgent } from '@/lib/agents/planner';
import { validateProblemStatement } from '@/lib/validators';
import { AgentError } from '@/lib/gemini';
import { PlanRequest } from '@/types/api';

export const maxDuration = 60; // 60 seconds timeout

export async function POST(req: Request) {
  try {
    const body = await req.json() as PlanRequest;
    
    const validation = validateProblemStatement(body.problemStatement);
    if (!validation.valid) {
      return NextResponse.json(
         { error: true, message: validation.error, suggestion: validation.suggestion },
         { status: 400 }
      );
    }

    const plannerOutput = await runPlannerAgent(body.problemStatement);

    return NextResponse.json({ data: plannerOutput });
  } catch (error) {
    console.error('Planner Error:', error);
    if (error instanceof AgentError) {
      return NextResponse.json({ error: true, agent: error.agent, message: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: true, message: 'Internal Server Error' }, { status: 500 });
  }
}
