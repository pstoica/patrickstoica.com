import type { APIRoute } from "astro";

const CLAUDE_API_ENDPOINT = "https://api.anthropic.com/v1/messages";

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get("Content-Type") === "application/json") {
    const body = await request.json();
    const { content, cursorPosition, wordCount = 3 } = body;

    const prompt = `Context: "${content.slice(-100)}", Cursor: ${cursorPosition}
Generate 3 creative ${wordCount}-word suggestions. Be mystic and unexpected.
Respond with a JSON array: ["suggestion1", "suggestion2", "suggestion3"]`;

    try {
      console.log("Sending request to Claude API...");
      const response = await fetch(CLAUDE_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          max_tokens: 150,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `HTTP error! status: ${response.status}, body: ${errorBody}`
        );
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const content = data.content[0].text;
      let suggestions: string[];

      try {
        suggestions = JSON.parse(content);
        if (!Array.isArray(suggestions) || suggestions.length !== 3) {
          throw new Error("Invalid suggestions format");
        }
      } catch (error) {
        console.error("Error parsing suggestions:", error);
        throw new Error("Failed to parse suggestions");
      }

      return new Response(JSON.stringify({ suggestions }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error calling Claude API:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      return new Response(
        JSON.stringify({ error: "Failed to generate suggestions" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(null, { status: 400 });
};
