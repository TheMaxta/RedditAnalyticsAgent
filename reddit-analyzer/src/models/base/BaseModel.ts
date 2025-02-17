import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export abstract class BaseModel<T extends Record<string, any>> {
  protected supabase: SupabaseClient<Database>
  protected tableName: keyof Database['public']['Tables']

  constructor(supabase: SupabaseClient<Database>, tableName: keyof Database['public']['Tables']) {
    this.supabase = supabase
    this.tableName = tableName
  }

  async findOne(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as T | null
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    const { data: created, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return created as T
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const { data: updated, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated as T
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) throw error
  }
} 