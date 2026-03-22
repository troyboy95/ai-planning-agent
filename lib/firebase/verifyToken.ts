import { adminAuth } from './admin';
import { DecodedIdToken } from 'firebase-admin/auth';

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

export async function verifyIdToken(authHeader: string | null): Promise<VerifiedToken> {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing or malformed Authorization header', 401);
  }

  const token = authHeader.slice(7);

  let decoded: DecodedIdToken;
  try {
    decoded = await adminAuth.verifyIdToken(token, true); 
  } catch (err: any) {
    if (err.code === 'auth/id-token-revoked') {
      throw new AuthError('Token has been revoked. Please sign in again.', 401);
    }
    if (err.code === 'auth/id-token-expired') {
      throw new AuthError('Token expired. Please sign in again.', 401);
    }
    throw new AuthError('Invalid authentication token.', 401);
  }

  return {
    uid:   decoded.uid,
    email: decoded.email,
    name:  decoded.name,
  };
}
