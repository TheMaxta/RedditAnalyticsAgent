import { BaseService } from './base/BaseService'

export class CacheService extends BaseService {
  private static readonly CACHE_DURATIONS = {
    POSTS: 12 * 60 * 60 * 1000, // 12 hours
    THEMES: 7 * 24 * 60 * 60 * 1000, // 7 days
    SUBREDDITS: 24 * 60 * 60 * 1000 // 24 hours
  }

  isFresh(timestamp: string | null, duration: keyof typeof CacheService.CACHE_DURATIONS): boolean {
    if (!timestamp) {
      console.log(`[Cache] No timestamp found, treating as stale`);
      return false;
    }
    
    const lastUpdate = new Date(timestamp).getTime();
    const now = Date.now();
    const isFresh = now - lastUpdate < CacheService.CACHE_DURATIONS[duration];
    
    console.log(`[Cache] Data ${isFresh ? 'is' : 'is not'} fresh (${duration})`);
    return isFresh;
  }

  getExpiryTime(duration: keyof typeof CacheService.CACHE_DURATIONS): Date {
    const now = new Date();
    now.setTime(now.getTime() + CacheService.CACHE_DURATIONS[duration]);
    console.log(`[Cache] Setting expiry for ${duration} to ${now.toISOString()}`);
    return now;
  }
} 