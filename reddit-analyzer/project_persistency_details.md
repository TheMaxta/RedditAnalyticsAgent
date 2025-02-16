# Reddit Analyzer Persistence Design
> Using MVC architecture with Supabase integration

## 1. Project Structure

```
src/
├── app/                      # Next.js App Router (View layer)
├── models/                   # Model layer
│   ├── base/
│   │   └── BaseModel.ts     # Base model with common Supabase operations
│   ├── SubredditModel.ts    # Subreddit data operations
│   ├── PostModel.ts         # Post data operations
│   └── ThemeModel.ts        # Theme analysis operations
├── controllers/             # Controller layer
│   ├── base/
│   │   └── BaseController.ts # Common controller logic
│   ├── SubredditController.ts # Subreddit business logic
│   ├── PostController.ts     # Post fetching & caching logic
│   └── ThemeController.ts    # Theme analysis logic
├── services/                # Service layer
│   ├── RedditService.ts     # Reddit API interactions
│   ├── OpenAIService.ts     # OpenAI API interactions
│   └── CacheService.ts      # Caching logic
├── lib/
│   ├── supabase.ts         # Supabase client
│   └── constants.ts        # Cache durations, etc.
└── types/
    ├── models.ts           # Model interfaces
    ├── api.ts             # API response types
    └── database.ts        # Supabase types
```

## 2. Layer Responsibilities

### 2.1 Models (Data Layer)
- Direct database interactions
- No business logic
- Pure database operations

```typescript
// Example Model Structure
interface BaseModel {
  create(data: T): Promise<T>;
  findOne(id: string): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

interface SubredditModel extends BaseModel {
  findByName(name: string): Promise<Subreddit>;
  updateLastFetched(name: string): Promise<void>;
}

interface PostModel extends BaseModel {
  findBySubreddit(subredditId: string): Promise<Post[]>;
  findRecentPosts(subredditId: string, hours: number): Promise<Post[]>;
}
```

### 2.2 Controllers (Business Logic)
- Orchestrate data flow
- Handle business rules
- Coordinate between services

```typescript
// Example Controller Structure
interface SubredditController {
  getSubredditData(name: string): Promise<SubredditData>;
  refreshSubredditData(name: string): Promise<void>;
  handleNewPosts(name: string): Promise<void>;
}

interface PostController {
  getRecentPosts(subreddit: string): Promise<PostData[]>;
  shouldRefreshPosts(subreddit: string): Promise<boolean>;
  cacheNewPosts(posts: Post[]): Promise<void>;
}
```

### 2.3 Services (External Interactions)
- Handle external API calls
- Manage caching logic
- Process data transformations

## 3. Data Flow Examples

### 3.1 Fetching Subreddit Posts
```typescript
// High-level flow
1. Route handler calls SubredditController
2. Controller checks cache via PostModel
3. If fresh: return cached data
4. If stale:
   - RedditService fetches new posts
   - PostModel caches results
   - Return combined data
```

### 3.2 Theme Analysis
```typescript
// High-level flow
1. Route handler calls ThemeController
2. Controller checks cache via ThemeModel
3. For uncached posts:
   - OpenAIService performs analysis
   - ThemeModel stores results
4. Return complete analysis
```

## 4. Key Interfaces

### 4.1 Model Layer
```typescript
interface CacheableModel {
  lastFetched: Date;
  isFresh(): boolean;
  shouldRefresh(): boolean;
}

interface SubredditData extends CacheableModel {
  name: string;
  posts: Post[];
  themes: ThemeAnalysis[];
}
```

### 4.2 Controller Layer
```typescript
interface CacheController {
  getCached<T>(key: string): Promise<T | null>;
  setCached<T>(key: string, data: T): Promise<void>;
  invalidate(key: string): Promise<void>;
}
```

## 5. Implementation Phases

### Phase 1: Foundation (Week 1)
1. Set up project structure
2. Implement base classes
3. Create Supabase tables
4. Add model interfaces

### Phase 2: Core Features (Week 2)
1. Implement models
2. Add controllers
3. Create services
4. Basic error handling

### Phase 3: Caching (Week 3)
1. Add caching logic
2. Implement refresh mechanisms
3. Handle race conditions
4. Add cache invalidation

### Phase 4: Integration (Week 4)
1. Connect to frontend
2. Add loading states
3. Error boundaries
4. Performance optimization

## 6. Benefits of MVC Approach

### 6.1 Maintainability
- Clear separation of concerns
- Easier to test individual components
- Simplified debugging

### 6.2 Extensibility
- Easy to add new models
- Simple to modify business logic
- Flexible caching strategies

### 6.3 Testability
- Isolated components
- Clear interfaces
- Mockable services

## 7. Error Handling Strategy

### 7.1 Model Layer
- Database errors
- Validation errors
- Constraint violations

### 7.2 Controller Layer
- Business logic errors
- Cache coordination
- Race conditions

### 7.3 Service Layer
- API failures
- Network issues
- Rate limiting

## 8. Future Considerations

### 8.1 Scalability
- Model relationships
- Caching strategies
- Query optimization

### 8.2 Features
- User authentication
- Advanced caching
- Real-time updates

This document provides a comprehensive plan for adding Supabase persistence to your Reddit Analyzer while maintaining compatibility with your existing architecture. 