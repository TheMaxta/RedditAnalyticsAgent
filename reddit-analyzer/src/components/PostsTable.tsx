import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RedditPost } from "@/types/reddit";
import { ThemeAnalysis } from "@/types/themes";
import { formatDistanceToNow } from "date-fns";
import { Loader2, ArrowBigUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Post {
  id: string;
  title: string;
  content: string | null;
  score: number;
  num_comments: number;
  url: string;
  created_at: string;
}

interface PostsTableProps {
  posts: Post[];
  themes?: ThemeAnalysis[];
  isAnalyzing: boolean;
}

export function PostsTable({ posts, themes = [], isAnalyzing }: PostsTableProps) {
  const getThemesForPost = (postId: string) => {
    const analysis = themes.find(t => t.post_id === postId);
    if (!analysis) return [];

    const activeThemes = [];
    if (analysis.categories.isSolutionRequest) activeThemes.push("Solution");
    if (analysis.categories.isPainOrAnger) activeThemes.push("Pain & Anger");
    if (analysis.categories.isAdviceRequest) activeThemes.push("Advice");
    if (analysis.categories.isMoneyTalk) activeThemes.push("Money");
    if (analysis.categories.isResearch) activeThemes.push("Research");
    if (analysis.categories.isDiscussion) activeThemes.push("Discussion");
    if (analysis.categories.hasVideoContent) activeThemes.push("Video");
    return activeThemes;
  };

  // Sort posts by score
  const sortedPosts = [...posts].sort((a, b) => b.score - a.score);

  return (
    <Table>
      <TableHeader className="bg-table-header text-white">
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead className="w-[200px]">Categories</TableHead>
          <TableHead className="w-[100px] text-right">Upvotes</TableHead>
          <TableHead className="w-[100px] text-right">Comments</TableHead>
          <TableHead className="w-[150px] text-right">Posted</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedPosts.map((post, index) => (
          <TableRow key={post.id} className={index % 2 === 0 ? "bg-table-row" : ""}>
            <TableCell>
              <a 
                href={post.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-caribbean_current-700 text-caribbean_current transition-colors"
              >
                {post.title}
              </a>
            </TableCell>
            <TableCell>
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Analyzing...
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {getThemesForPost(post.id).map(theme => (
                    <Badge key={`${post.id}-${theme}`}>{theme}</Badge>
                  ))}
                </div>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <ArrowBigUp className="h-4 w-4 text-caribbean_current" />
                {post.score}
              </div>
            </TableCell>
            <TableCell className="text-right">{post.num_comments}</TableCell>
            <TableCell className="text-right">
              {formatDistanceToNow(post.created_at, { addSuffix: true })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 