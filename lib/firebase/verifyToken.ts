import { adminAuth } from './admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

export interface VerifiedToken {
  uid:   string;
  email: string | undefined;
  name:  string | undefined;
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function verifySessionToken(): Promise<VerifiedToken> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    throw new AuthError('Missing session cookie', 401);
  }

  let decoded: DecodedIdToken;
  try {
    decoded = await adminAuth.verifySessionCookie(sessionCookie, true); 
  } catch (err: any) {
    if (err.code === 'auth/session-cookie-revoked') {
      throw new AuthError('Session revoked. Please sign in again.', 401);
    }
    if (err.code === 'auth/session-cookie-expired') {
      throw new AuthError('Session expired. Please sign in again.', 401);
    }
    throw new AuthError('Invalid session.', 401);
  }

  return {
    uid:   decoded.uid,
    email: decoded.email,
    name:  decoded.name,
  };
}
