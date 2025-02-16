import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RedditPost } from "@/types/reddit";
import { formatDistanceToNow } from "date-fns";

interface PostsTableProps {
  posts: RedditPost[];
}

export function PostsTable({ posts }: PostsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead className="w-[100px] text-right">Score</TableHead>
          <TableHead className="w-[100px] text-right">Comments</TableHead>
          <TableHead className="w-[150px] text-right">Posted</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.url}>
            <TableCell>
              <a 
                href={post.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {post.title}
              </a>
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