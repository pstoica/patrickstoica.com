import type { APIRoute } from "astro";

// Outputs: /divinate.json
export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get("Content-Type") === "application/json") {
    const body = await request.json();
    const { content, cursorPosition } = body;

    // Here you would typically send this data to an LLM API
    // For now, we'll just return some mock suggestions
    const suggestions = ["suggestion1", "suggestion2", "suggestion3"];

    return new Response(
      JSON.stringify({
        suggestions,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  return new Response(null, { status: 400 });
};
