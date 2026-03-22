import { getIdToken } from '@/lib/firebase/auth';

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type':  'application/json',
    },
  });
}
