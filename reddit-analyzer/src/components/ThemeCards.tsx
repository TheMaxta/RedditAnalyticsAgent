import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeAnalysis } from "@/types/themes";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface ThemeCardsProps {
  analyses: ThemeAnalysis[];
}

export function ThemeCards({ analyses = [] }: ThemeCardsProps) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const themes = {
    solutionRequest: {
      title: "Solution Requests",
      posts: analyses.filter(a => a.categories.isSolutionRequest),
      description: "Posts asking for solutions"
    },
    painOrAnger: {
      title: "Pain & Anger",
      posts: analyses.filter(a => a.categories.isPainOrAnger),
      description: "Posts expressing frustration or anger"
    },
    adviceRequest: {
      title: "Advice Requests",
      posts: analyses.filter(a => a.categories.isAdviceRequest),
      description: "Posts seeking advice"
    },
    moneyTalk: {
      title: "Money Talk",
      posts: analyses.filter(a => a.categories.isMoneyTalk),
      description: "Posts discussing spending or money"
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(themes).map(([key, theme]) => (
        <Sheet key={key}>
          <SheetTrigger asChild>
            <Card className="hover:bg-papaya_whip-800 transition-colors cursor-pointer border-caribbean_current-200">
              <CardHeader>
                <CardTitle className="text-rich_black">{theme.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-rich_black-700 mb-2">{theme.description}</p>
                <p className="font-bold text-caribbean_current">{theme.posts.length} posts</p>
              </CardContent>
            </Card>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{theme.title}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              {theme.posts.map(post => (
                <div key={post.post_id} className="space-y-2">
                  <a 
                    href={post.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium hover:underline"
                  >
                    {post.title}
                  </a>
                  <p className="text-sm text-muted-foreground">
                    {post.reasoning[key as keyof typeof post.reasoning]}
                  </p>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
} 