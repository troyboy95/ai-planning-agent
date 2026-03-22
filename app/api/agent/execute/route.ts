import { NextResponse } from 'next/server';
import { runExecutionAgent } from '@/lib/agents/execution';
import { AgentError } from '@/lib/gemini';
import { ExecuteRequest } from '@/types/api';

export const maxDuration = 60; // 60 seconds timeout

export async function POST(req: Request) {
  try {
    const body = await req.json() as ExecuteRequest;
    
    if (!body.problemStatement || !body.plannerOutput || !body.insightOutput) {
      return NextResponse.json(
         { error: true, message: 'Missing required fields' },
         { status: 400 }
      );
    }

    const executionOutput = await runExecutionAgent(
      body.problemStatement, 
      body.plannerOutput, 
      body.insightOutput
    );

    return NextResponse.json({ data: executionOutput });
  } catch (error) {
    console.error('Execution Error:', error);
    if (error instanceof AgentError) {
      return NextResponse.json({ error: true, agent: error.agent, message: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: true, message: 'Internal Server Error' }, { status: 500 });
  }
}
