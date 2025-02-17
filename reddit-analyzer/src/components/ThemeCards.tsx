import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeAnalysis } from "@/types/themes";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { ArrowBigUp } from "lucide-react";

interface ThemeCardsProps {
  analyses: ThemeAnalysis[];
}

const sortByScore = (posts: ThemeAnalysis[]) => 
  posts.sort((a, b) => (b.posts?.score || 0) - (a.posts?.score || 0));

export function ThemeCards({ analyses = [] }: ThemeCardsProps) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const themes = {
    solutionRequest: {
      title: "Solution Requests",
      posts: sortByScore(analyses.filter(a => a.categories.isSolutionRequest)),
      description: "Posts asking for solutions"
    },
    painOrAnger: {
      title: "Pain & Anger",
      posts: sortByScore(analyses.filter(a => a.categories.isPainOrAnger)),
      description: "Posts expressing frustration or anger"
    },
    adviceRequest: {
      title: "Advice Requests",
      posts: sortByScore(analyses.filter(a => a.categories.isAdviceRequest)),
      description: "Posts seeking advice"
    },
    moneyTalk: {
      title: "Money Talk",
      posts: sortByScore(analyses.filter(a => a.categories.isMoneyTalk)),
      description: "Posts discussing spending or money"
    },
    research: {
      title: "Research & Studies",
      posts: sortByScore(analyses.filter(a => a.categories.isResearch)),
      description: "Posts about research, papers, or studies"
    },
    discussion: {
      title: "General Discussion",
      posts: sortByScore(analyses.filter(a => a.categories.isDiscussion)),
      description: "Open discussions and conversations"
    },
    videoContent: {
      title: "Video Content",
      posts: sortByScore(analyses.filter(a => a.categories.hasVideoContent)),
      description: "Posts referencing or sharing videos"
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
          <SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl">{theme.title}</SheetTitle>
              <p className="text-muted-foreground">{theme.description}</p>
            </SheetHeader>
            <div className="space-y-6">
              {theme.posts.map(analysis => (
                <div 
                  key={analysis.post_id} 
                  className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <a 
                      href={analysis.posts?.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-lg font-medium hover:underline flex-grow text-caribbean_current"
                    >
                      {analysis.posts?.title}
                    </a>
                    <div className="flex items-center gap-1 text-sm">
                      <ArrowBigUp className="h-4 w-4 text-caribbean_current" />
                      <span className="font-medium">{analysis.posts?.score}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis.reasoning[key as keyof typeof analysis.reasoning]}
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