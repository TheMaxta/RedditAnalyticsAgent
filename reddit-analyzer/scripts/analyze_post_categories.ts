import { RedditPost } from './fetch-ollama-posts';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define the zod schema for the structured output
const PostAnalysisExtraction = z.object({
  categories: z.object({
    isSolutionRequest: z.boolean(),
    isPainOrAnger: z.boolean(),
    isAdviceRequest: z.boolean(),
    isMoneyTalk: z.boolean()
  }),
  reasoning: z.object({
    solutionRequest: z.string().optional(),
    painOrAnger: z.string().optional(),
    adviceRequest: z.string().optional(),
    moneyTalk: z.string().optional()
  })
});

type PostAnalysisSchema = z.infer<typeof PostAnalysisExtraction>;

interface PostCategoryAnalysis {
  postId: string;
  title: string;
  categories: PostAnalysisSchema["categories"];
  reasoning: PostAnalysisSchema["reasoning"];
}

class PostAnalyzer {
  private async analyzePostWithAI(post: RedditPost): Promise<PostAnalysisSchema> {
    const prompt = `Analyze this Reddit post and return a JSON response categorizing it:

Post Title: ${post.title}
Post Content: ${post.content}`;

    try {
      // Log when the API call is starting
      console.log(`Starting API call for post: "${post.title}"`);

      const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
          {
            role: "system",
            content:
              "You are an expert at analyzing Reddit posts. Return JSON with boolean categories and optional reasoning."
          },
          { role: "user", content: prompt }
        ],
        response_format: zodResponseFormat(PostAnalysisExtraction, "post_analysis_extraction")
      });

      // Log the entire API response (parsed result)
      console.log(`API call completed for post: "${post.title}"`);
      console.log("Returned data:", JSON.stringify(completion.choices[0].message.parsed, null, 2));

      const parsed = completion.choices[0].message.parsed;
      if (!parsed) {
        throw new Error("Failed to parse AI response according to the schema.");
      }
      return parsed;
    } catch (error) {
      console.error(`Error analyzing post "${post.title}" with AI:`, error);
      throw error;
    }
  }

  public async analyzePost(post: RedditPost): Promise<PostCategoryAnalysis> {
    const analysis = await this.analyzePostWithAI(post);
    return {
      postId: post.url,
      title: post.title,
      categories: analysis.categories,
      reasoning: analysis.reasoning
    };
  }

  public async analyzePosts(posts: RedditPost[]): Promise<PostCategoryAnalysis[]> {
    const analyses: PostCategoryAnalysis[] = [];

    // Process posts one at a time (with logging) to avoid rate limiting
    for (const post of posts) {
      console.log(`\n--- Analyzing post: "${post.title}" ---`);
      const analysis = await this.analyzePost(post);
      analyses.push(analysis);
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return analyses;
  }

  public generateSummary(analyses: PostCategoryAnalysis[]): void {
    const totalPosts = analyses.length;
    const categoryCounts = {
      solutionRequests: 0,
      painAndAnger: 0,
      adviceRequests: 0,
      moneyTalk: 0
    };

    analyses.forEach(analysis => {
      if (analysis.categories.isSolutionRequest) categoryCounts.solutionRequests++;
      if (analysis.categories.isPainOrAnger) categoryCounts.painAndAnger++;
      if (analysis.categories.isAdviceRequest) categoryCounts.adviceRequests++;
      if (analysis.categories.isMoneyTalk) categoryCounts.moneyTalk++;
    });

    console.log("\n=== Post Category Analysis Summary ===");
    console.log(`Total Posts Analyzed: ${totalPosts}`);
    console.log(
      `Solution Requests: ${categoryCounts.solutionRequests} (${totalPosts ? ((categoryCounts.solutionRequests / totalPosts) * 100).toFixed(1) : 0}%)`
    );
    console.log(
      `Pain & Anger Posts: ${categoryCounts.painAndAnger} (${totalPosts ? ((categoryCounts.painAndAnger / totalPosts) * 100).toFixed(1) : 0}%)`
    );
    console.log(
      `Advice Requests: ${categoryCounts.adviceRequests} (${totalPosts ? ((categoryCounts.adviceRequests / totalPosts) * 100).toFixed(1) : 0}%)`
    );
    console.log(
      `Money Related: ${categoryCounts.moneyTalk} (${totalPosts ? ((categoryCounts.moneyTalk / totalPosts) * 100).toFixed(1) : 0}%)`
    );

    this.printDetailedAnalysis(analyses);
  }

  private printDetailedAnalysis(analyses: PostCategoryAnalysis[]): void {
    console.log("\n=== Detailed Analysis by Category ===");

    const categories = [
      { name: "Solution Requests", key: "isSolutionRequest", reasonKey: "solutionRequest" },
      { name: "Pain & Anger", key: "isPainOrAnger", reasonKey: "painOrAnger" },
      { name: "Advice Requests", key: "isAdviceRequest", reasonKey: "adviceRequest" },
      { name: "Money Talk", key: "isMoneyTalk", reasonKey: "moneyTalk" }
    ] as const;

    categories.forEach(category => {
      console.log(`\n${category.name}:`);
      const examples = analyses.filter(analysis => analysis.categories[category.key]).slice(0, 3);

      examples.forEach(example => {
        console.log(`\nTitle: ${example.title}`);
        if (example.reasoning[category.reasonKey]) {
          console.log(`Reasoning: ${example.reasoning[category.reasonKey]}`);
        }
      });
    });
  }
}


async function main() {
  try {
    // Add command line argument parsing
    const postIndex = process.argv[2] ? parseInt(process.argv[2]) : undefined;
    
    const { fetchOllamaPosts } = await import('./fetch-ollama-posts');
    const allPosts = await fetchOllamaPosts();

    console.log(`Fetched ${allPosts.length} posts total.`);
    
    const analyzer = new PostAnalyzer();
    
    if (postIndex !== undefined) {
      // Validate post index
      if (postIndex < 0 || postIndex >= allPosts.length) {
        throw new Error(`Invalid post index: ${postIndex}. Must be between 0 and ${allPosts.length - 1}`);
      }
      
      // Analyze single post
      console.log(`Analyzing only post at index ${postIndex}`);
      const singlePost = allPosts[postIndex];
      const analysis = await analyzer.analyzePost(singlePost);
      analyzer.generateSummary([analysis]);
    } else {
      // Analyze all posts
      const analyses = await analyzer.analyzePosts(allPosts);
      analyzer.generateSummary(analyses);
    }
  } catch (error) {
    console.error("Error in post category analysis:", error);
    process.exit(1);
  }
}


// If using CommonJS, the following check is acceptable.
// For ES modules, consider invoking main() directly.
if (require.main === module) {
  main();
}

export type { PostCategoryAnalysis };
export { PostAnalyzer };