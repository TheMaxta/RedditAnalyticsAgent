"use client";

import { PostsTable } from "@/components/PostsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RedditPost } from "@/types/reddit";
import { use, useEffect, useState } from "react";

export default function SubredditPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">r/{name}</h1>
        <p className="text-muted-foreground">Posts from the past 24 hours</p>
      </div>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">Top posts</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
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
            <PostsTable posts={posts} />
          )}
        </TabsContent>

        <TabsContent value="themes" className="space-y-4">
          <div className="rounded-md border">
            <div className="p-4">
              <p className="text-sm text-muted-foreground">
                Loading themes...
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 