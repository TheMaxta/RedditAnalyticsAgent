import { BaseController } from './base/BaseController'
import { ThemeModel } from '@/models/ThemeModel'
import { OpenAIService } from '@/services/OpenAIService'
import { Database } from '@/types/database'
import { ThemeAnalysis } from '@/types/themes'

type Theme = Database['public']['Tables']['theme_analyses']['Row']

export class ThemeController extends BaseController {
  private themeModel: ThemeModel
  private openAIService: OpenAIService

  constructor() {
    super()
    this.themeModel = new ThemeModel()
    this.openAIService = new OpenAIService()
  }

  async analyzePostThemes(posts: Array<{ id: string, title: string, content: string }>): Promise<ThemeAnalysis[]> {
    return this.withErrorHandling(async () => {
      // Check for existing analyses
      const existingAnalyses = await this.themeModel.findByPostIds(posts.map(p => p.id))
      const analyzedPostIds = new Set(existingAnalyses.map(a => a.post_id))
      
      // Filter posts that need analysis
      const postsToAnalyze = posts.filter(p => !analyzedPostIds.has(p.id))
      
      if (postsToAnalyze.length > 0) {
        const newAnalyses = await this.openAIService.analyzeBatch(postsToAnalyze)
        await this.themeModel.createBatch(newAnalyses)
        
        return [...existingAnalyses, ...newAnalyses]
      }
      
      return existingAnalyses
    })
  }
} 