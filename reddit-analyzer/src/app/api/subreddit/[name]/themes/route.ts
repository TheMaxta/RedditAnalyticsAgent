import { ThemeAnalysis, PostThemes } from "@/types/themes";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { ThemeController } from "@/controllers/ThemeController";
import { PostController } from "@/controllers/PostController";

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
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  
  try {
    const postController = new PostController();
    const themeController = new ThemeController();
    const posts = await postController.getSubredditPosts(name);
    
    // Analyze themes
    const analyses = await themeController.analyzePostThemes(
      posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content || ''
      }))
    );

    return NextResponse.json(analyses);
  } catch (error) {
    console.error(`[Themes API] Error analyzing posts:`, error);
    return NextResponse.json(
      { error: 'Failed to analyze posts' }, 
      { status: 500 }
    );
  }
} 