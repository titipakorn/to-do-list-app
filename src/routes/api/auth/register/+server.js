import { registerUser } from '$lib/server/auth/service.js';

export async function POST({ request }) {
  try {
    let email, password;
    try {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } catch (parseError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid JSON request body'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email and password fields are required'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const result = await registerUser(email, password);

    return new Response(
      JSON.stringify({
        success: true,
        user: result.user,
        token: result.token
      }),
      {
        status: 201,
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
