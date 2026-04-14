import { loginUser } from '$lib/server/auth/service.js';

export async function POST({ request }) {
  try {
    const { email, password } = await request.json();
    const result = await loginUser(email, password);

    return new Response(
      JSON.stringify({
        success: true,
        user: result.user,
        token: result.token
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: error.status || 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
