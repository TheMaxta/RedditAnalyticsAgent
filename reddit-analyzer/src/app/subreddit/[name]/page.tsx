"use client";

import { PostsTable } from "@/components/PostsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RedditPost } from "@/types/reddit";
import { use, useEffect, useState } from "react";
import { ThemeCards } from "@/components/ThemeCards";
import { ThemeAnalysis } from "@/types/themes";

export default function SubredditPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState<ThemeAnalysis[]>([]);
  const [analyzingThemes, setAnalyzingThemes] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch(`/api/subreddit/${name}/posts`);
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [name]);

  useEffect(() => {
    async function analyzeThemes() {
      if (posts.length > 0 && !themes.length) {
        setAnalyzingThemes(true);
        try {
          const response = await fetch(`/api/subreddit/${name}/themes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(posts)
          });
          const data = await response.json();
          setThemes(data);
        } catch (error) {
          console.error('Failed to analyze themes:', error);
        } finally {
          setAnalyzingThemes(false);
        }
      }
    }

    analyzeThemes();
  }, [posts, name, themes.length]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-rich_black">r/{name}</h1>
        <p className="text-rich_black-700">Posts from the past 24 hours</p>
      </div>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList className="bg-tabs-inactive">
          <TabsTrigger 
            value="posts"
            className="data-[state=active]:bg-tabs data-[state=active]:text-white"
          >
            Top posts
          </TabsTrigger>
          <TabsTrigger 
            value="themes"
            className="data-[state=active]:bg-tabs data-[state=active]:text-white"
          >
            Themes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {loading ? (
            <div className="rounded-md border">
              <div className="p-4">
                <p className="text-sm text-muted-foreground">
                  Loading posts...
                </p>
              </div>
            </div>
          ) : (
            <PostsTable 
              posts={posts} 
              themes={themes} 
              isAnalyzing={analyzingThemes} 
            />
          )}
        </TabsContent>

        <TabsContent value="themes" className="space-y-4">
          {analyzingThemes ? (
            <div className="rounded-md border">
              <div className="p-4">
                <p className="text-sm text-muted-foreground">
                  Analyzing themes...
                </p>
              </div>
            </div>
          ) : (
            <ThemeCards analyses={themes} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 