import type { APIRoute } from "astro";

const CLAUDE_API_ENDPOINT = "https://api.anthropic.com/v1/messages";

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get("Content-Type") === "application/json") {
    const body = await request.json();
    const { content, cursorPosition } = body;

    const prompt = `Given the following context:
Content: "${content}"
Cursor Position: ${cursorPosition}

Please generate 3 diverse and creative suggestions for what could come next.
These suggestions should be brief (1-3 words) and take the writing in very different directions, although keep some with a safe path.
Be imaginative and unexpected. Think mystic, Tarot, and occult.
Make sure you do not prefix with bullets or numbers.`;

    try {
      const response = await fetch(CLAUDE_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-opus-20240229",
          max_tokens: 150,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const suggestions = data.content[0].text
        .split("\n")
        .filter((line: string) => line.trim() !== "")
        .slice(0, 3);

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
    } catch (error) {
      console.error("Error calling Claude API:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to generate suggestions",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }

  return new Response(null, { status: 400 });
};
