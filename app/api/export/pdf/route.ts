import { NextRequest, NextResponse } from 'next/server';
import { generatePdf } from '@/lib/export/pdf';
import { verifyIdToken, AuthError } from '@/lib/firebase/verifyToken';
import { getReport } from '@/lib/firebase/firestore';

export async function POST(req: NextRequest) {
  let uid: string;
  try {
    const verified = await verifyIdToken(req.headers.get('Authorization'));
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

    const buffer = await generatePdf(report);

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="report-${report.id}.pdf"`
      }
    });

  } catch (error) {
    console.error('PDF Export Error:', error);
    return NextResponse.json({ error: true, message: 'Failed to generate PDF' }, { status: 500 });
  }
}
