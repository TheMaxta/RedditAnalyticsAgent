# Reddit Analyzer Project PRD

**Version:** 1.0  
**Date:** February 16, 2025  
**Authors:** [Your Team]

## 1. Project Overview

The Reddit Analyzer project is a web application built using NextJS 14, shadcn components, Tailwind CSS, and Lucid icons. The application's primary function is to fetch Reddit posts from selected subreddits, analyze them using OpenAI's API, and display the results in an organized manner. Users can add new subreddits, view posts in a table format, and see categorized themes based on post analysis.

## 2. Goals & Objectives

- **User Engagement:** Allow users to easily add and explore subreddits.
- **Data Visibility:** Display Reddit posts from the past 24 hours in a sorted table.
- **Insights:** Analyze posts with AI to extract meaningful themes:
  - *Solution Requests* – Posts asking for solutions.
  - *Pain & Anger* – Posts expressing frustration or anger.
  - *Advice Requests* – Posts seeking advice.
  - *Money Talk* – Posts discussing spending or money.
- **Extensibility:** Enable users to add new analysis cards that trigger a re-run of the post analysis.

## 3. Technical Stack

- **Frontend:** NextJS 14, shadcn components, Tailwind CSS
- **Backend/Server-Side:** NextJS API routes (if needed) or server components
- **External Integrations:**
  - **Reddit API** via [snoowrap](https://github.com/not-an-aardvark/snoowrap) for fetching posts.
  - **OpenAI API** for categorizing post content using structured output.
- **Icons:** Lucid icons

## 4. Core Functionalities & Detailed Requirements

### 4.1. Subreddit Listing & Adding

- **Listing Existing Subreddits:**
  - Display available subreddits (e.g., "ollama", "openai") as cards on the homepage.
  - Each card should show the subreddit name and an associated icon.

- **Adding a New Subreddit:**
  - A clearly visible "Add Subreddit" button opens a modal.
  - In the modal, users can paste a Reddit URL.
  - On confirmation, a new subreddit card is added to the list.

### 4.2. Subreddit Detail Page

- **Navigation:**
  - Clicking on any subreddit card routes the user to a dynamic page (e.g., `/subreddit/[slug]`).

- **Tabs:**
  - **Top posts:** Displays a table of Reddit posts fetched from the subreddit.
  - **Themes:** Displays categorized analysis results.

### 4.3. Fetching Reddit Posts in "Top posts"

- **Data Source:** Use the snoowrap library to fetch posts.
- **Data Range:** Posts from the past 24 hours.
- **Data Fields:** Each post should include:
  - `title`
  - `score`
  - `content` (or selftext)
  - `url`
  - `created_utc`
  - `num_comments`
- **Display Requirements:**
  - Posts are shown in a table component.
  - Table should allow sorting based on the number of scores.

**Snoowrap Code Example:**

```typescript
import Snoowrap from 'snoowrap';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Interface for the post data we want to extract
interface RedditPost {
  title: string;
  content: string;
  score: number;
  numComments: number;
  created: Date;
  url: string;
}

// Initialize the Snoowrap client with environment variables
const reddit = new Snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT || '',
  clientId: process.env.REDDIT_CLIENT_ID || '',
  clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
  username: process.env.REDDIT_USERNAME || '',
  password: process.env.REDDIT_PASSWORD || '',
});

// Validate environment variables
function validateEnvVariables() {
  const required = [
    'REDDIT_USER_AGENT',
    'REDDIT_CLIENT_ID',
    'REDDIT_CLIENT_SECRET',
    'REDDIT_USERNAME',
    'REDDIT_PASSWORD'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

async function fetchOllamaPosts(): Promise<RedditPost[]> {
  try {
    // Get posts from r/ollama from the past 24 hours
    const posts = await reddit.getSubreddit('ollama').getNew({
      limit: 100 // Maximum posts to fetch
    });

    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);

    // Filter and map the posts
    const recentPosts = posts
      .filter(post => post.created_utc * 1000 > twentyFourHoursAgo)
      .map(post => ({
        title: post.title,
        content: post.selftext || '', // selftext contains the post content
        score: post.score,
        numComments: post.num_comments,
        created: new Date(post.created_utc * 1000),
        url: `https://reddit.com${post.permalink}`
      }));

    return recentPosts;

  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    throw error;
  }
}

// Example usage
async function main() {
  try {
    validateEnvVariables();
    const ollamaPosts = await fetchOllamaPosts();
    console.log('Recent Ollama Posts:', ollamaPosts);
    
    // Print each post in a readable format
    ollamaPosts.forEach((post, index) => {
      console.log(`\n--- Post ${index + 1} ---`);
      console.log(`Title: ${post.title}`);
      console.log(`Score: ${post.score}`);
      console.log(`Comments: ${post.numComments}`);
      console.log(`Created: ${post.created.toLocaleString()}`);
      console.log(`URL: ${post.url}`);
      if (post.content) {
        console.log(`Content: ${post.content.substring(0, 150)}...`);
      }
    });

  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

// Run the script
main();
```

### 4.4. Analyzing Reddit Posts in "Themes"

- **Analysis Requirements:**
  - For each post fetched, the post data should be sent to OpenAI's API.
  - Use a structured JSON output to categorize posts into four themes:
    - **Solution Requests:** Posts seeking solutions.
    - **Pain & Anger:** Posts expressing pain or anger.
    - **Advice Requests:** Posts seeking advice.
    - **Money Talk:** Posts discussing spending money.
  
- **Concurrency:**
  - Analysis of posts should be processed concurrently to improve performance.
  
- **Display:**
  - On the "Themes" page, each category is represented as a card showing:
    - Title
    - Description
    - Count of posts in that category
  - Clicking a category card opens a side panel with a detailed list of posts belonging to that category.

- **Re-analysis Trigger:**
  - If users add new analysis cards, the system should re-trigger the analysis process.

**OpenAI Analysis Code Example:**

```typescript
import { RedditPost } from './fetch-ollama-posts';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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

    for (const post of posts) {
      console.log(`\n--- Analyzing post: "${post.title}" ---`);
      const analysis = await this.analyzePost(post);
      analyses.push(analysis);
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
    const postIndex = process.argv[2] ? parseInt(process.argv[2]) : undefined;
    
    const { fetchOllamaPosts } = await import("./fetch-ollama-posts");
    const allPosts = await fetchOllamaPosts();

    console.log(`Fetched ${allPosts.length} posts total.`);
    
    const analyzer = new PostAnalyzer();
    
    if (postIndex !== undefined) {
      if (postIndex < 0 || postIndex >= allPosts.length) {
        throw new Error(`Invalid post index: ${postIndex}. Must be between 0 and ${allPosts.length - 1}`);
      }
      
      console.log(`Analyzing only post at index ${postIndex}`);
      const singlePost = allPosts[postIndex];
      const analysis = await analyzer.analyzePost(singlePost);
      analyzer.generateSummary([analysis]);
    } else {
      const analyses = await analyzer.analyzePosts(allPosts);
      analyzer.generateSummary(analyses);
    }
  } catch (error) {
    console.error("Error in post category analysis:", error);
    process.exit(1);
  }
}

if (require.main === module) {