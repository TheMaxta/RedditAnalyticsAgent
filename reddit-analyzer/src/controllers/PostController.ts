import { BaseController } from './base/BaseController'
import { PostModel } from '@/models/PostModel'
import { RedditService } from '@/services/RedditService'
import { SubredditController } from './SubredditController'
import { Database } from '@/types/database'

type Post = Database['public']['Tables']['posts']['Row']

export class PostController extends BaseController {
  private postModel: PostModel
  private redditService: RedditService
  private subredditController: SubredditController

  constructor() {
    super()
    this.postModel = new PostModel()
    this.redditService = new RedditService()
    this.subredditController = new SubredditController()
  }

  async getSubredditPosts(subredditName: string): Promise<Post[]> {
    return this.withErrorHandling(async () => {
      const subreddit = await this.subredditController.getOrCreateSubreddit(subredditName)
      
      if (await this.subredditController.shouldRefreshData(subredditName)) {
        const redditPosts = await this.redditService.getRecentPosts(subredditName)
        
        // Transform and save posts
        const posts = await this.postModel.createBatch(redditPosts.map(post => ({
          subreddit_id: subreddit.id,
          reddit_id: post.reddit_id,
          title: post.title,
          content: post.content,
          score: post.score,
          num_comments: post.numComments,
          url: post.url,
          created_at: post.created.toISOString()
        })))

        // Update last_fetched after successful update
        await this.subredditController.updateLastFetched(subredditName)

        return posts
      }

      return this.postModel.findBySubreddit(subreddit.id)
    })
  }
} 