# Project overview

You will be using NextJS 14, shadcn, tailwind, Lucid icon

# Core functionalities

1. See list of available sub reddits & add new sub reddits
   1. Users can see list of available sub reddits that already created display in cards, common ones like "ollama", "openai"
   2. Users can clicking on an add reddit button, which should open a modal for users to paste in reddit url and add
   3. After users adding a new reddit, a new card should be added

2. Subreddit page
   1. Clicking on each subreddit, should goes to a reddit page
   2. With 2 tabs: "Top posts", "Themes"

3. Fetch reddit posts data in "Top posts"
   1. Under "Top posts" page, we want to display fetched reddit posts from past 24 hrs
   2. We will use snowrap as library to fetch reddit data
   3. Each post including title, score, content, url, created_utc, num_comments
   4. Display the reddits in a table component, Sort based on num of score

4. Analyse reddit posts data in "Themes"
   1. For each post, we should send post data to OpenAI using structured output to categorise "Solution requests", "Pain & anger", "Advice requests", "Money talk";
      1. "Solution requests": Posts where people are seeking solutions for problems
      2. "Pain & anger": Posts where people are expressing pains or anger
      3. "Advice requests": Posts where people are seeking advice
      4. "Money talk": Posts where people are talking about spending money
   2. This process needs to be ran concurrently for posts, so it will be faster
   3. In "Themes" page, we should display each category as a card, with title, description & num of counts
   4. Clicking on the card will open side panel to display all posts under this category

5. Ability to add new cards
   1. Users should be able to add a new card
   2. After a new card is added, it should trigger the analysis again

# Doc
## Documentation of how to use snoowrap to fetch reddit posts
CODE EXAMPLE:
```
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

# Current File Structure
