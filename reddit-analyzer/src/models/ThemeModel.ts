import { BaseModel } from './base/BaseModel'
import { Database } from '@/types/database'
import { supabase } from '@/lib/supabase'

type ThemeAnalysis = Database['public']['Tables']['theme_analyses']['Row']

export class ThemeModel extends BaseModel<ThemeAnalysis> {
  constructor() {
    super(supabase, 'theme_analyses')
  }

  async findByPostIds(postIds: string[]): Promise<ThemeAnalysis[]> {
    const { data, error } = await this.supabase
      .from('theme_analyses')
      .select(`
        *,
        posts (
          id,
          title,
          url,
          score
        )
      `)
      .in('post_id', postIds)

    if (error) throw error
    return data
  }

  async createBatch(analyses: Array<Omit<ThemeAnalysis, 'id' | 'analyzed_at'>>): Promise<ThemeAnalysis[]> {
    const { data, error } = await this.supabase
      .from('theme_analyses')
      .upsert(analyses, {
        onConflict: 'post_id'
      })
      .select(`
        *,
        posts (
          id,
          title,
          url,
          score
        )
      `)

    if (error) throw error
    return data
  }

  async findStaleAnalyses(hours: number): Promise<ThemeAnalysis[]> {
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - hours)

    const { data, error } = await this.supabase
      .from('theme_analyses')
      .select('*')
      .lt('analyzed_at', cutoff.toISOString())

    if (error) throw error
    return data
  }
} 