import { callOpenRouter } from "@/src/lib/openrouter";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const { tagCounts } = await req.json();

  const prompt = `
You are a marketing assistant for a coffee shop.

Here are the TOP customer interests (Tag: Frequency):
${JSON.stringify(tagCounts, null, 2)}

Generate 3 promo themes for this week.

For each theme provide:
- Theme
- Segment description
- Why now
- Ready message (1-2 friendly sentences with CTA)
- Best time window

Return ONLY raw JSON. Strictly no prose. Output must be a valid JSON array. If you fail, the system will crash.
with these attributes:
{ 
  theme: string;
  segment_description: string;
  why_now: string;
  ready_message: string;
  best_time_window?: string;
}
Do not include any markdown formatting, backticks, or conversational text. Start with [ and end with ].
CRITICAL: Do not wrap the array in an object like { 'promotions': [...] }. Return the array [ ... ] as the top-level element.
`;

  try {
    const data = await callOpenRouter(
      [{ role: "user", content: prompt }],
      true,
    );
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
