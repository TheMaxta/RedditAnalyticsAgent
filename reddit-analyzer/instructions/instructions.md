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


```

# Project Structure
.
├── README.md
├── components.json
├── eslint.config.mjs
├── instructions
│   └── instructions.md
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── project_persistency_details.md
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── scripts
├── scripts-test
│   ├── analyze_post_categories.ts
│   ├── fetch-ollama-posts.ts
│   ├── package-lock.json
│   └── package.json
├── src
│   ├── app
│   │   ├── api
│   │   │   └── subreddit
│   │   │       └── [name]
│   │   │           ├── posts
│   │   │           │   └── route.ts
│   │   │           └── themes
│   │   │               └── route.ts
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── subreddit
│   │       └── [name]
│   │           └── page.tsx
│   ├── components
│   │   ├── AddSubredditModal.tsx
│   │   ├── PostsTable.tsx
│   │   ├── SubredditCard.tsx
│   │   ├── ThemeCards.tsx
│   │   └── ui
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── sheet.tsx
│   │       ├── table.tsx
│   │       └── tabs.tsx
│   ├── lib
│   │   └── utils.ts
│   └── types
│       ├── reddit.ts
│       └── themes.ts
├── tailwind.config.ts
└── tsconfig.json