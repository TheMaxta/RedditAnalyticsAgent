import { BaseService } from './base/BaseService'
import OpenAI from 'openai'
import { ThemeAnalysis } from '@/types/themes'
import { z } from 'zod'

export class OpenAIService extends BaseService {
  private openai: OpenAI

  constructor() {
    super()
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://oai.helicone.ai/v1",
      defaultHeaders: {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
      },
    })
  }

  private ThemeResponseSchema = z.object({
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
  })

  async analyzePost(postId: string, title: string, content: string, url: string): Promise<ThemeAnalysis> {
    return this.withErrorHandling(async () => {
      console.log(`[OpenAI] Analyzing post: "${title.substring(0, 50)}..."`);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a post analyzer that categorizes Reddit posts into specific themes."
          },
          {
            role: "user",
            content: `Analyze this Reddit post:\nTitle: ${title}\nContent: ${content}`
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
      })

      const analysis = this.ThemeResponseSchema.parse(
        JSON.parse(completion.choices[0].message.function_call?.arguments || "{}")
      )

      console.log(`[OpenAI] Analysis complete for post: ${postId}`);
      return {
        post_id: postId,
        title: title,
        url: url,
        categories: analysis.categories,
        reasoning: analysis.reasoning
      }
    })
  }

  async analyzeBatch(posts: Array<{ id: string, title: string, content: string, url: string }>): Promise<ThemeAnalysis[]> {
    return this.withErrorHandling(async () => {
      console.log(`[OpenAI] Starting batch analysis of ${posts.length} posts`);
      // Process in parallel with concurrency limit
      const concurrencyLimit = 3
      const results: ThemeAnalysis[] = []
      
      for (let i = 0; i < posts.length; i += concurrencyLimit) {
        const batch = posts.slice(i, i + concurrencyLimit)
        const analyses = await Promise.all(
          batch.map(post => this.analyzePost(post.id, post.title, post.content, post.url))
        )
        results.push(...analyses)
      }

      console.log(`[OpenAI] Completed batch analysis`);
      return results
    })
  }
} 