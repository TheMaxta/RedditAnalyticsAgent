export interface Database {
    public: {
      Tables: {
        subreddits: {
          Row: {
            id: string
            name: string
            last_fetched: string | null
            created_at: string
          }
          Insert: {
            id?: string
            name: string
            last_fetched?: string | null
            created_at?: string
          }
          Update: {
            id?: string
            name?: string
            last_fetched?: string | null
            created_at?: string
          }
        }
        posts: {
          Row: {
            id: string
            subreddit_id: string
            reddit_id: string
            title: string
            content: string | null
            score: number
            num_comments: number
            url: string
            created_at: string
            fetched_at: string
          }
          Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'fetched_at'>
          Update: Partial<Database['public']['Tables']['posts']['Insert']>
        }
        theme_analyses: {
          Row: {
            id: string
            post_id: string
            categories: {
              isSolutionRequest: boolean
              isPainOrAnger: boolean
              isAdviceRequest: boolean
              isMoneyTalk: boolean
            }
            reasoning: {
              solutionRequest?: string
              painOrAnger?: string
              adviceRequest?: string
              moneyTalk?: string
            }
            analyzed_at: string
          }
          Insert: Omit<Database['public']['Tables']['theme_analyses']['Row'], 'id' | 'analyzed_at'>
          Update: Partial<Database['public']['Tables']['theme_analyses']['Insert']>
        }
      }
    }
  }
  