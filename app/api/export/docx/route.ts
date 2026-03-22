import { NextRequest, NextResponse } from 'next/server';
import { generateDocx } from '@/lib/export/docx';
import { verifySessionToken, AuthError } from '@/lib/firebase/verifyToken';
import { getReport } from '@/lib/firebase/firestore';

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
    if (!body || !body.reportId) {
      return NextResponse.json({ error: true, message: 'Invalid request data' }, { status: 400 });
    }

    const report = await getReport(uid, body.reportId);
    if (!report) {
      return NextResponse.json({ error: true, message: 'Report not found' }, { status: 404 });
    }

    const buffer = await generateDocx(report);

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="report-${report.id}.docx"`
      }
    });

  } catch (error) {
    console.error('DOCX Export Error:', error);
    return NextResponse.json({ error: true, message: 'Failed to generate DOCX' }, { status: 500 });
  }
}
