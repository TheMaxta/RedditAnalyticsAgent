import { BaseModel } from './base/BaseModel'
import { Database } from '@/types/database'
import { supabase } from '@/lib/supabase'

type Subreddit = Database['public']['Tables']['subreddits']['Row']

export class SubredditModel extends BaseModel<Subreddit> {
  constructor() {
    super(supabase, 'subreddits')
  }

  async findByName(name: string): Promise<Subreddit | null> {
    const { data, error } = await this.supabase
      .from('subreddits')
      .select('*')
      .eq('name', name)
      .maybeSingle()

    if (error) throw error
    return data
  }

  async updateLastFetched(name: string): Promise<void> {
    const { error } = await this.supabase
      .from('subreddits')
      .update({ last_fetched: new Date().toISOString() })
      .eq('name', name)

    if (error) throw error
  }

  async findStale(hours: number): Promise<Subreddit[]> {
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - hours)

    const { data, error } = await this.supabase
      .from('subreddits')
      .select('*')
      .or(`last_fetched.is.null,last_fetched.lt.${cutoff.toISOString()}`)

    if (error) throw error
    return data
  }

  async findAll(): Promise<Subreddit[]> {
    const { data, error } = await this.supabase
      .from('subreddits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
} 