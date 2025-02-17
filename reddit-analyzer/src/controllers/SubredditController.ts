import { BaseController } from './base/BaseController'
import { SubredditModel } from '@/models/SubredditModel'
import { RedditService } from '@/services/RedditService'
import { Database } from '@/types/database'

type Subreddit = Database['public']['Tables']['subreddits']['Row']

export class SubredditController extends BaseController {
  private subredditModel: SubredditModel
  private redditService: RedditService

  constructor() {
    super()
    this.subredditModel = new SubredditModel()
    this.redditService = new RedditService()
  }

  async getOrCreateSubreddit(name: string): Promise<Subreddit> {
    return this.withErrorHandling(async () => {
      let subreddit = await this.subredditModel.findByName(name)
      
      if (!subreddit) {
        subreddit = await this.subredditModel.create({
          name,
          last_fetched: null,
          created_at: new Date().toISOString()
        })
      }

      return subreddit
    })
  }

  async shouldRefreshData(name: string): Promise<boolean> {
    const subreddit = await this.subredditModel.findByName(name)
    if (!subreddit) return true
    
    return !this.cacheService.isFresh(subreddit.last_fetched, 'POSTS')
  }

  async updateLastFetched(name: string): Promise<void> {
    return this.withErrorHandling(async () => {
      await this.subredditModel.updateLastFetched(name)
    })
  }
} 