import { NextResponse } from "next/server";

type Body = {
  industry?: string;
  projectType?: string;
  budget?: string;
  teamSize?: string;
  role?: string;
  userGoals?: string;
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

// Call only Gemini 2.0 Flash using header-based API key auth.
type GeminiResult = { parsed?: any; rawText: string; fullResponse: any };

async function callGemini2Flash(
  apiKey: string,
  inputs: Body
): Promise<GeminiResult> {
  const SYSTEM_PROMPT = `You are an evaluation engine for Luis Ibarra's portfolio website.
You MUST return only a single JSON object (no markdown, no commentary, no code fences).
Luis is a front-end–focused fullstack developer with strengths Luis's strengths as a front-end–focused fullstack developer 
  with background in industrial design, rapid prototyping, UI/UX, React, Node, Supabase, Cloudflare, R2, Neon, MongoDB, Posgresql, 
  Gemini AI, and computer vision, object oriented programming.
Be Luis's advocate but realistic about fit.\n Luis doesn't have professional experience but a very strong 
  portfolio with 20-30 great projects. Luis is looking for software engineering entry level jobs , internships,
  of freelance opportunities. and do not invent skills Luis doesn't have.
Produce a numeric compatibility score and a category breakdown with numeric scores.
All numeric scores must be numbers (0-100) or null if unknown.`;
  const userGoalsSafe = (inputs.userGoals || "").replace(/"/g, "'");
  const USER_PROMPT = `User Inputs:\nIndustry: ${
    inputs.industry || ""
  }\nProject Type: ${inputs.projectType || ""}\nBudget: ${
    inputs.budget || ""
  }\nTeam Size: ${inputs.teamSize || ""}\nLuis Role: ${
    inputs.role || ""
  }\nUser Goals Text: "${userGoalsSafe}"\n\nReturn a single JSON object EXACTLY matching this schema (use these keys):\n{\n  "compatibility_score": <number 0-100 or null>,\n  "category_breakdown": {\n    "industry_score": <number 0-100 or null>,\n    "project_type_score": <number 0-100 or null>,\n    "team_role_fit_score": <number 0-100 or null>,\n    "budget_score": <number 0-100 or null>,\n    "user_goals_score": <number 0-100 or null>\n  },\n  "summary": "<short human readable summary>",\n  "recommendation": "<short recommendation to hiring manager as to best role for Luis>"\n}\n\nReturn only that JSON object.`;

  const promptText = SYSTEM_PROMPT + "\n\n" + USER_PROMPT;

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  const body = { contents: [{ parts: [{ text: promptText }] }] };
  const headers = {
    "Content-Type": "application/json",
    "X-goog-api-key": apiKey,
  };

  // Masked log only (do not print the key)
  console.warn("Gemini request to", {
    url: url.replace(/(key=)[^&]+/, "$1***"),
  });

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const txt = await res.text();

  if (!res.ok) {
    // return debug info via throw so caller can include message
    throw new Error(`Gemini non-ok ${res.status}: ${txt.slice(0, 400)}`);
  }

  let data: any;
  try {
    data = JSON.parse(txt);
  } catch (e) {
    data = txt;
  }

  // Preferred shape: candidates[0].content.parts[0].text
  let text: string | null = null;
  try {
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = data.candidates[0].content.parts[0].text;
    }
    if (!text && typeof data?.candidates?.[0]?.output === "string") {
      text = data.candidates[0].output;
    }
  } catch (e) {
    // ignore
  }

  if (!text) {
    const raw = typeof data === "string" ? data : JSON.stringify(data);
    const m = raw.match(/{[\s\S]*}/);
    if (!m) {
      // Return raw for inspection instead of throwing.
      return { rawText: raw, fullResponse: data };
    }
    text = m[0];
  }

  // Normalize: strip common markdown code fences (```json ... ```) before parsing
  let normalized = String(text || "").trim();
  const fenceMatch = normalized.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    normalized = fenceMatch[1].trim();
  }
  // Remove surrounding quotes if model wrapped JSON in quotes
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  try {
    const parsed = JSON.parse(normalized);
    return { parsed, rawText: text, fullResponse: data };
  } catch (e) {
    // Try to extract a JSON substring as a fallback
    const m = normalized.match(/{[\s\S]*}/);
    if (m) {
      try {
        const parsed = JSON.parse(m[0]);
        return { parsed, rawText: text, fullResponse: data };
      } catch (err) {
        return { rawText: text, fullResponse: data };
      }
    }
    return { rawText: text, fullResponse: data };
  }
}

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();

    const industry = (body.industry || "").toLowerCase();
    const projectType = (body.projectType || "").toLowerCase();
    const budget = (body.budget || "").toLowerCase();
    const teamSize = (body.teamSize || "").toLowerCase();
    const role = (body.role || "").toLowerCase();
    const userGoals = body.userGoals || "";

    // Minimal template — scores left null so Gemini can provide numeric values.
    const template = {
      compatibility_score: null as number | null,
      category_breakdown: {
        industry_score: null as number | null,
        project_type_score: null as number | null,
        team_role_fit_score: null as number | null,
        budget_score: null as number | null,
        user_goals_score: null as number | null,
      },
      summary: "",
      recommendation: "",
    };

    const apiKey = process.env.GOOGLE_API_KEY;
    let geminiError: string | null = null;
    let geminiDebug: any = null;

    if (apiKey) {
      try {
        const geminiResult = await callGemini2Flash(apiKey, body);
        const parsed = geminiResult.parsed;

        // If Gemini returned parsed JSON, forward it (include debug meta).
        if (parsed) {
          const debug = {
            rawText: geminiResult.rawText
              ? String(geminiResult.rawText).slice(0, 1000)
              : null,
            fullResponse: geminiResult.fullResponse
              ? JSON.stringify(geminiResult.fullResponse).slice(0, 2000)
              : null,
          };
          return NextResponse.json({
            ...parsed,
            meta: {
              source: "gemini",
              gemini_parsed: parsed,
              gemini_debug: debug,
            },
          });
        }
      } catch (e: any) {
        geminiError = String(e?.message || e);
        console.warn("Gemini call failed", geminiError);
      }
    }

    return NextResponse.json({
      ...template,
      meta: {
        source: "local",
        gemini_error: geminiError,
        gemini_debug: geminiDebug,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
