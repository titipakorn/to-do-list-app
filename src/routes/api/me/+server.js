export function GET({ locals }) {
  if (!locals.user) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unauthorized'
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      user: locals.user
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}
