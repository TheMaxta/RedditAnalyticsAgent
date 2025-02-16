import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

interface SubredditCardProps {
  name: string;
}

export function SubredditCard({ name }: SubredditCardProps) {
  return (
    <Link href={`/subreddit/${name}`}>
      <Card className="hover:bg-papaya_whip-800 transition-colors cursor-pointer">
        <CardHeader className="flex flex-row items-center gap-4">
          <MessageSquare className="w-8 h-8 text-caribbean_current" />
          <CardTitle className="text-rich_black">{name}</CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
}