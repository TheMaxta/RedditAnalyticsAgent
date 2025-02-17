import { BaseService } from '@/services/base/BaseService'
import { CacheService } from '@/services/CacheService'

export abstract class BaseController {
  protected cacheService: CacheService

  constructor() {
    this.cacheService = new CacheService()
  }

  protected handleError(error: any): never {
    console.error('[Controller Error]:', error)
    throw error
  }

  protected async withErrorHandling<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      return this.handleError(error)
    }
  }
} 