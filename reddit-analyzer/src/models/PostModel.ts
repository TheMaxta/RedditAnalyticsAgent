import { BaseModel } from './base/BaseModel'
import { Database } from '@/types/database'
import { supabase } from '@/lib/supabase'

type Post = Database['public']['Tables']['posts']['Row']

export class PostModel extends BaseModel<Post> {
  constructor() {
    super(supabase, 'posts')
  }

  async findBySubreddit(subredditId: string): Promise<Post[]> {
    const { data, error } = await this.supabase
      .from('posts')
      .select('*')
      .eq('subreddit_id', subredditId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async findRecentPosts(subredditId: string, hours: number): Promise<Post[]> {
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - hours)

    const { data, error } = await this.supabase
      .from('posts')
      .select('*')
      .eq('subreddit_id', subredditId)
      .gte('created_at', cutoff.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async createBatch(posts: Array<Omit<Post, 'id' | 'fetched_at'>>): Promise<Post[]> {
    const { data, error } = await this.supabase
      .from('posts')
      .upsert(posts, {
        onConflict: 'reddit_id',
        ignoreDuplicates: true
      })
      .select()

    if (error) throw error
    return data
  }

  async updateScores(updates: Array<{ id: string, score: number, num_comments: number }>): Promise<void> {
    for (const update of updates) {
      const { error } = await this.supabase
        .from('posts')
        .update({
          score: update.score,
          num_comments: update.num_comments
        })
        .eq('id', update.id)

      if (error) throw error
    }
  }
} 