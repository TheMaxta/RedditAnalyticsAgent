import { BaseService } from './base/BaseService'
import Snoowrap from 'snoowrap'
import { RedditPost } from '@/types/reddit'

export class RedditService extends BaseService {
  private reddit: Snoowrap

  constructor() {
    super()
    this.reddit = new Snoowrap({
      userAgent: process.env.REDDIT_USER_AGENT || '',
      clientId: process.env.REDDIT_CLIENT_ID || '',
      clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
      username: process.env.REDDIT_USERNAME || '',
      password: process.env.REDDIT_PASSWORD || '',
    })
  }

  async getRecentPosts(subredditName: string, hours: number = 24): Promise<RedditPost[]> {
    return this.withErrorHandling(async () => {
      console.log(`[Reddit] Fetching posts from r/${subredditName}`);
      
      const posts = await this.reddit.getSubreddit(subredditName).getNew({
        limit: 100
      })

      const cutoff = Date.now() - (hours * 60 * 60 * 1000)
      
      const filteredPosts = posts
        .filter(post => post.created_utc * 1000 > cutoff)
        .map(post => ({
          title: post.title,
          content: post.selftext || '',
          score: post.score,
          numComments: post.num_comments,
          created: new Date(post.created_utc * 1000),
          url: `https://reddit.com${post.permalink}`,
          reddit_id: post.id
        }))
        .sort((a, b) => b.score - a.score)

      console.log(`[Reddit] Found ${filteredPosts.length} posts in last ${hours} hours`);
      return filteredPosts
    })
  }
} 