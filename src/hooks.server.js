import { verifyToken, extractToken } from '$lib/server/auth/jwt.js';
import { getUserById } from '$lib/server/auth/service.js';

export async function handle({ event, resolve }) {
  // Extract token from Authorization header
  const authHeader = event.request.headers.get('authorization');
  const token = extractToken(authHeader);

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const user = getUserById(payload.id);
      if (user) {
        event.locals.user = user;
      }
    }
  }

  return resolve(event);
}
