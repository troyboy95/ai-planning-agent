import { NextResponse } from 'next/server';
import { runInsightAgent } from '@/lib/agents/insight';
import { AgentError } from '@/lib/gemini';
import { InsightRequest } from '@/types/api';

export const maxDuration = 60; // 60 seconds timeout

export async function POST(req: Request) {
  try {
    const body = await req.json() as InsightRequest;
    
    if (!body.problemStatement || !body.plannerOutput) {
      return NextResponse.json(
         { error: true, message: 'Missing required fields: problemStatement or plannerOutput' },
         { status: 400 }
      );
    }

    const insightOutput = await runInsightAgent(body.problemStatement, body.plannerOutput);

    return NextResponse.json({ data: insightOutput });
  } catch (error) {
    console.error('Insight Error:', error);
    if (error instanceof AgentError) {
      return NextResponse.json({ error: true, agent: error.agent, message: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: true, message: 'Internal Server Error' }, { status: 500 });
  }
}
