import { ThemeAnalysis, PostThemes } from "@/types/themes";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://oai.helicone.ai/v1",
  defaultHeaders: {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
  },
});

const ThemeResponseSchema = z.object({
  categories: z.object({
    isSolutionRequest: z.boolean(),
    isPainOrAnger: z.boolean(),
    isAdviceRequest: z.boolean(),
    isMoneyTalk: z.boolean()
  }),
  reasoning: z.object({
    solutionRequest: z.string().nullable().optional(),
    painOrAnger: z.string().nullable().optional(),
    adviceRequest: z.string().nullable().optional(),
    moneyTalk: z.string().nullable().optional()
  })
});

export async function POST(
  request: Request,
  { params }: { params: { name: string } }
) {
  console.log(`[Themes API] Analyzing posts for r/${params.name}`);
  
  try {
    const posts = await request.json();
    console.log(`[Themes API] Analyzing ${posts.length} posts`);
    const analyses: ThemeAnalysis[] = [];

    for (const post of posts) {
      console.log(`[Themes API] Analyzing post: "${post.title.substring(0, 50)}..."`);
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a post analyzer that categorizes Reddit posts into specific themes."
          },
          {
            role: "user",
            content: `Analyze this Reddit post:\nTitle: ${post.title}\nContent: ${post.content}`
          }
        ],
        functions: [{
          name: "analyze_post",
          description: "Categorize a Reddit post into themes",
          parameters: {
            type: "object",
            properties: {
              categories: {
                type: "object",
                properties: {
                  isSolutionRequest: { type: "boolean" },
                  isPainOrAnger: { type: "boolean" },
                  isAdviceRequest: { type: "boolean" },
                  isMoneyTalk: { type: "boolean" }
                },
                required: ["isSolutionRequest", "isPainOrAnger", "isAdviceRequest", "isMoneyTalk"]
              },
              reasoning: {
                type: "object",
                properties: {
                  solutionRequest: { type: "string" },
                  painOrAnger: { type: "string" },
                  adviceRequest: { type: "string" },
                  moneyTalk: { type: "string" }
                }
              }
            },
            required: ["categories", "reasoning"]
          }
        }],
        function_call: { name: "analyze_post" }
      });

      const analysis = ThemeResponseSchema.parse(
        JSON.parse(completion.choices[0].message.function_call?.arguments || "{}")
      );

      analyses.push({
        postId: post.url,
        title: post.title,
        categories: analysis.categories,
        reasoning: analysis.reasoning
      });
    }

    console.log(`[Themes API] Completed analysis of ${analyses.length} posts`);
    return NextResponse.json(analyses);
  } catch (error) {
    console.error(`[Themes API] Error analyzing posts:`, error);
    return NextResponse.json({ error: 'Failed to analyze posts' }, { status: 500 });
  }
} 