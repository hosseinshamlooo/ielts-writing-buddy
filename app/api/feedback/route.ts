import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { essay, taskType, prompt } = await request.json();

    if (!essay || essay.trim().length === 0) {
      return NextResponse.json(
        { error: "Essay is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    // Create a detailed prompt for IELTS feedback
    const systemPrompt = `You are an expert IELTS Writing examiner. Analyze the essay and provide detailed feedback in the following format:

Task Response: [score 0-9]
Coherence & Cohesion: [score 0-9]
Lexical Resource: [score 0-9]
Grammar: [score 0-9]

Overall Score: [average score]

Feedback: [2-3 sentences of general feedback]

Provide scores as decimals (e.g., 6.5, 7.0). Be specific and constructive in your feedback.`;

    // Include the prompt if provided for better context
    const promptContext = prompt
      ? `\n\nTask Prompt:\n${prompt}\n`
      : "";

    const userPrompt = `Please evaluate this IELTS ${taskType || "Task 2"} essay:${promptContext}

Essay:
${essay}

Provide your evaluation in the exact format specified.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using mini for cost efficiency, can change to gpt-4 if needed
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const feedback = completion.choices[0]?.message?.content || "";

    // Also generate highlights for the essay
    const highlightsPrompt = `Analyze this IELTS essay and identify specific phrases or sentences that need improvement or are particularly good. Return a JSON object with a "highlights" array containing objects with this format:
{
  "highlights": [
    {
      "text": "exact phrase from essay",
      "type": "needs-improvement" or "good",
      "reason": "brief explanation"
    }
  ]
}

Only include 3-5 highlights. Focus on vocabulary, grammar, and style issues.`;

    const highlightsCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an IELTS writing tutor. Return only valid JSON in the exact format requested, no additional text.",
        },
        { role: "user", content: `${promptContext ? `Task Prompt:\n${prompt}\n\n` : ""}Essay:\n${essay}\n\n${highlightsPrompt}` },
      ],
      temperature: 0.5,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    interface Highlight {
      text: string;
      type: string;
      reason?: string;
      id?: string;
    }

    let highlights: Highlight[] = [];
    try {
      const highlightsResponse =
        highlightsCompletion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(highlightsResponse) as { highlights?: Highlight[] };
      // Handle both {highlights: [...]} and direct array formats
      const highlightsArray = parsed.highlights || [];
      if (!Array.isArray(highlightsArray)) {
        highlights = [];
      } else {
        // Add IDs to highlights
        highlights = highlightsArray.map((h: Highlight, idx: number) => ({
          ...h,
          id: h.id || `highlight-${idx}`,
        }));
      }
    } catch (e) {
      console.error("Error parsing highlights:", e);
      highlights = [];
    }

    return NextResponse.json({
      feedback,
      highlights,
    });
  } catch (error: unknown) {
    console.error("Error generating feedback:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate feedback";
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

