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
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PostsTableProps {
  posts: RedditPost[];
  themes?: ThemeAnalysis[];
  isAnalyzing: boolean;
}

export function PostsTable({ posts, themes = [], isAnalyzing }: PostsTableProps) {
  const getThemesForPost = (postUrl: string) => {
    const analysis = themes.find(t => t.postId === postUrl);
    if (!analysis) return [];

    const activeThemes = [];
    if (analysis.categories.isSolutionRequest) activeThemes.push("Solution");
    if (analysis.categories.isPainOrAnger) activeThemes.push("Pain & Anger");
    if (analysis.categories.isAdviceRequest) activeThemes.push("Advice");
    if (analysis.categories.isMoneyTalk) activeThemes.push("Money");
    return activeThemes;
  };

  return (
    <Table>
      <TableHeader className="bg-table-header text-white">
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead className="w-[200px]">Categories</TableHead>
          <TableHead className="w-[100px] text-right">Score</TableHead>
          <TableHead className="w-[100px] text-right">Comments</TableHead>
          <TableHead className="w-[150px] text-right">Posted</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post, index) => (
          <TableRow key={post.url} className={index % 2 === 0 ? "bg-table-row" : ""}>
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
                  {getThemesForPost(post.url).map(theme => (
                    <Badge variant="secondary" className="bg-papaya_whip-800 text-rich_black">
                      {theme}
                    </Badge>
                  ))}
                </div>
              )}
            </TableCell>
            <TableCell className="text-right">{post.score}</TableCell>
            <TableCell className="text-right">{post.numComments}</TableCell>
            <TableCell className="text-right">
              {formatDistanceToNow(post.created, { addSuffix: true })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 