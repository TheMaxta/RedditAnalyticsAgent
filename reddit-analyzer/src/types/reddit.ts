export interface RedditPost {
  id: string;
  title: string;
  content: string | null;
  score: number;
  num_comments: number;
  url: string;
  created_at: string;
  reddit_id: string;
} 