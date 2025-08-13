import { AnalysisInput, AnalysisResult, Verdict } from "../types/analysis";

const API_URL = "https://api.a0.dev/ai/llm";

const schema = {
  type: "object",
  required: ["verdict", "confidence", "reasoning", "citations", "inputEcho", "analyzedAt"],
  properties: {
    verdict: { type: "string", enum: ["truth", "harmful", "misinformation"] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    reasoning: { type: "string" },
    citations: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["title", "url"],
        properties: {
          title: { type: "string" },
          url: { type: "string" },
          excerpt: { type: "string" },
        },
      },
    },
    inputEcho: {
      type: "object",
      properties: {
        url: { type: "string" },
        text: { type: "string" },
        pdf: {
          anyOf: [
            { type: "null" },
            {
              type: "object",
              required: ["name", "size"],
              properties: {
                name: { type: "string" },
                size: { type: "number" },
                type: { type: "string" },
              },
            },
          ],
        },
      },
      additionalProperties: false,
    },
    analyzedAt: { type: "number" },
  },
  additionalProperties: false,
} as const;

export async function analyzeHealthClaim(input: AnalysisInput, userEmail?: string): Promise<AnalysisResult> {
  const now = Date.now();
  const messages = [
    {
      role: "system",
      content:
        "You are a Health Misinformation Safety Analyst. Classify input as 'truth', 'harmful', or 'misinformation'. Provide concise reasoning and at least one reputable citation (WHO, CDC, PubMed, government health sites). If unsure, prefer 'misinformation' or 'harmful' depending on risk. Be cautious and safety-first.",
    },
    {
      role: "user",
      content: JSON.stringify({
        instructions:
          "Analyze the following possible health misinformation inputs. Consider url content if provided, the text statement, and any PDF metadata if available. If the URL is provided, prioritize assessing the claim based on the landing content; if only text is provided, analyze the text. If only a PDF is provided and its contents are unavailable, use the filename context sparingly and avoid overclaiming.",
        input,
        context: {
          submittedBy: userEmail ?? null,
          platform: "react-native-web",
          purpose:
            "Safety triage for health information. Output structured JSON matching the schema, include citations with authoritative sources.",
        },
        now,
      }),
    },
  ];

  const res = await globalThis.fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, schema }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI request failed: ${res.status} ${text}`);
  }

  const data: any = await res.json();
  // a0 API returns either { completion } or { schema_data }
  const result: AnalysisResult | undefined = data?.schema_data;
  if (!result) {
    // Fallback: map completion text to a minimal result
    const completion: string = data?.completion ?? "";
    const guessVerdict: Verdict =
      /harmful/i.test(completion)
        ? "harmful"
        : /misinfo|false|inaccurate/i.test(completion)
        ? "misinformation"
        : "truth";
    return {
      verdict: guessVerdict,
      confidence: 0.5,
      reasoning: completion.slice(0, 500),
      citations: [
        {
          title: "World Health Organization",
          url: "https://www.who.int/",
        },
      ],
      inputEcho: input,
      analyzedAt: now,
    };
  }

  return result;
}
