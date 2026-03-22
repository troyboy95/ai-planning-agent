import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, AuthError } from '@/lib/firebase/verifyToken';
import { getUserReports } from '@/lib/firebase/firestore';

export async function GET(req: NextRequest) {
  let uid: string;
  try {
    const verified = await verifyIdToken(req.headers.get('Authorization'));
    uid = verified.uid;
  } catch(err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const reports = await getUserReports(uid);
    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error('GET /api/reports Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: String(error.message || error) }, { status: 500 });
  }
}
