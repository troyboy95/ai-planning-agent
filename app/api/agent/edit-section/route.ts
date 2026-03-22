import { NextRequest, NextResponse } from 'next/server';
import { runEditorAgent } from '@/lib/agents/editor';
import { AgentError } from '@/lib/gemini';
import { EditSectionRequest } from '@/types/api';
import { verifySessionToken, AuthError } from '@/lib/firebase/verifyToken';
import { checkRateLimit } from '@/lib/rateLimit';
import { getReport, updateReport } from '@/lib/firebase/firestore';

export const maxDuration = 60; // 60 seconds timeout

export async function POST(req: NextRequest) {
  let uid: string;
  try {
    const verified = await verifySessionToken();
    uid = verified.uid;
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: true, message: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    // We expect the client to send reportId with edit request now.
    const { sectionId, currentContent, editInstruction, reportContext, reportId } = body;

    if (!sectionId || !currentContent || !editInstruction || !reportContext || !reportId) {
      return NextResponse.json(
        { error: true, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existing = await getReport(uid, reportId);
    if (!existing) {
      return NextResponse.json({ error: true, message: 'Report not found' }, { status: 404 });
    }

    const limited = await checkRateLimit(uid, 'edit-section', 20, 60);
    if (limited) {
      return NextResponse.json({ error: true, message: 'Too many edits. Wait a moment.' }, { status: 429 });
    }

    const updatedContent = await runEditorAgent(
      sectionId,
      currentContent,
      editInstruction,
      reportContext
    );

    const updatedContentStr = JSON.stringify(updatedContent);

    const updatedSections = existing.sections.map(s =>
      s.id === sectionId
        ? { ...s, rawText: updatedContentStr, versions: [...(s.versions || []), s.rawText || ''] }
        : s
    );

    await updateReport(uid, reportId, { sections: updatedSections });

    const changesSummary = `Applied instruction: "${editInstruction}"`;

    return NextResponse.json({
      data: {
        updatedContent: updatedContentStr,
        changesSummary
      }
    });

  } catch (error) {
    console.error('Editor Error:', error);
    if (error instanceof AgentError) {
      return NextResponse.json({ error: true, agent: error.agent, message: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: true, message: 'Internal Server Error' }, { status: 500 });
  }
}
