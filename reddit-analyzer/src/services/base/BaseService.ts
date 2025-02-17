export abstract class BaseService {
  protected handleError(error: any): never {
    // Log the error or send to error reporting service
    console.error('[Service Error]:', error)
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