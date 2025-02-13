import Snoowrap from 'snoowrap';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Interface for the post data we want to extract
export interface RedditPost {
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

export async function fetchOllamaPosts(): Promise<RedditPost[]> {
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