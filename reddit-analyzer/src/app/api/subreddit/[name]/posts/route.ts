import { RedditPost } from "@/types/reddit";
import { NextResponse } from "next/server";
import Snoowrap from "snoowrap";

const reddit = new Snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT || '',
  clientId: process.env.REDDIT_CLIENT_ID || '',
  clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
  username: process.env.REDDIT_USERNAME || '',
  password: process.env.REDDIT_PASSWORD || '',
});

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const posts = await reddit.getSubreddit(params.name).getNew({
      limit: 100
    });

    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);

    const recentPosts: RedditPost[] = posts
      .filter(post => post.created_utc * 1000 > twentyFourHoursAgo)
      .map(post => ({
        title: post.title,
        content: post.selftext || '',
        score: post.score,
        numComments: post.num_comments,
        created: new Date(post.created_utc * 1000),
        url: `https://reddit.com${post.permalink}`
      }))
      .sort((a, b) => b.score - a.score);

    return NextResponse.json(recentPosts);
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
} 