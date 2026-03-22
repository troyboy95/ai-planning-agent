import { adminFirestore } from './admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Report } from '@/types/report';

const db = adminFirestore;

export async function createOrUpdateUser(uid: string, data: {
  email?: string;
  displayName?: string;
  photoURL?: string;
}): Promise<void> {
  const ref = db.collection('users').doc(uid);
  await ref.set({
    ...data,
    lastLoginAt: FieldValue.serverTimestamp(),
    createdAt:   FieldValue.serverTimestamp(),
  }, { merge: true });
}

export async function saveReport(uid: string, report: Report): Promise<string> {
  const ref = db.collection('users').doc(uid).collection('reports').doc(report.id);
  await ref.set({
    ...report,
    userId:    uid,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: report.createdAt ?? FieldValue.serverTimestamp(),
  });
  return report.id;
}

export async function updateReport(
  uid: string, 
  reportId: string, 
  updates: Partial<Report>
): Promise<void> {
  const ref = db.collection('users').doc(uid).collection('reports').doc(reportId);

  const doc = await ref.get();
  if (!doc.exists) throw new Error('Report not found');
  if (doc.data()?.userId !== uid) throw new Error('Forbidden');

  await ref.update({
    ...updates,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function getUserReports(uid: string): Promise<Report[]> {
  const snap = await db
    .collection('users').doc(uid)
    .collection('reports')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();

  return snap.docs.map(doc => {
    const data = doc.data() as Report;
    const rawData = doc.data(); // For checking raw Firestore types
    return {
      ...data,
      id: doc.id,
      createdAt: rawData.createdAt?.toDate ? rawData.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: rawData.updatedAt?.toDate ? rawData.updatedAt.toDate().toISOString() : data.updatedAt,
    };
  });
}

export async function getReport(uid: string, reportId: string): Promise<Report | null> {
  const ref = db.collection('users').doc(uid).collection('reports').doc(reportId);
  const doc = await ref.get();
  if (!doc.exists) return null;
  
  const data = doc.data() as Report;
  const rawData = doc.data()!;
  if (data?.userId !== uid) return null;
  
  return { 
    ...data, 
    id: doc.id,
    createdAt: rawData.createdAt?.toDate ? rawData.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: rawData.updatedAt?.toDate ? rawData.updatedAt.toDate().toISOString() : data.updatedAt,
  };
}

export async function deleteReport(uid: string, reportId: string): Promise<void> {
  const ref = db.collection('users').doc(uid).collection('reports').doc(reportId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Report not found');
  if (doc.data()?.userId !== uid) throw new Error('Forbidden');
  await ref.delete();
}

export async function incrementPlanCount(uid: string): Promise<void> {
  const ref = db.collection('users').doc(uid);
  await ref.set({ planCount: FieldValue.increment(1) }, { merge: true });
}
