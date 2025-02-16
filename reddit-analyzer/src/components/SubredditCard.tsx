import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

interface SubredditCardProps {
  name: string;
}

export function SubredditCard({ name }: SubredditCardProps) {
  return (
    <Link href={`/subreddit/${name}`}>
      <Card className="hover:bg-accent transition-colors cursor-pointer">
        <CardHeader className="flex flex-row items-center gap-4">
          <MessageSquare className="w-8 h-8 text-orange-500" />
          <CardTitle>r/{name}</CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
}