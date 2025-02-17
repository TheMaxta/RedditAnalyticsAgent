"use client";

import { AddSubredditModal } from "@/components/AddSubredditModal";
import { SubredditCard } from "@/components/SubredditCard";
import { SubredditModel } from "@/models/SubredditModel";
import { useEffect, useState } from "react";

export default function Home() {
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const subredditModel = new SubredditModel();

  useEffect(() => {
    async function loadSubreddits() {
      try {
        const data = await subredditModel.findAll();
        setSubreddits(data.map(s => s.name));
      } catch (error) {
        console.error('Failed to load subreddits:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSubreddits();
  }, []);

  const handleAddSubreddit = async (newSubreddit: string) => {
    if (!subreddits.includes(newSubreddit)) {
      try {
        await subredditModel.create({
          name: newSubreddit,
          last_fetched: null,
          created_at: new Date().toISOString()
        });
        setSubreddits([...subreddits, newSubreddit]);
      } catch (error) {
        console.error('Failed to add subreddit:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading subreddits...</div>;
  }

  return (
    <main className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Reddit Analyzer</h1>
        <AddSubredditModal onAddSubreddit={handleAddSubreddit} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subreddits.map((subreddit) => (
          <SubredditCard key={subreddit} name={subreddit} />
        ))}
      </div>
    </main>
  );
}