import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, AuthError } from '@/lib/firebase/verifyToken';
import { getReport, deleteReport } from '@/lib/firebase/firestore';

export async function GET(req: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  let uid: string;
  try {
    const verified = await verifySessionToken();
    uid = verified.uid;
  } catch(err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { reportId } = await params;
  
  try {
    const report = await getReport(uid, reportId);
    if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  let uid: string;
  try {
    const verified = await verifySessionToken();
    uid = verified.uid;
  } catch(err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { reportId } = await params;
  
  try {
    await deleteReport(uid, reportId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
