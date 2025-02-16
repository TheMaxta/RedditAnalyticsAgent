"use client";

import { AddSubredditModal } from "@/components/AddSubredditModal";
import { SubredditCard } from "@/components/SubredditCard";
import { useState } from "react";

// This will be replaced with actual data storage later
const INITIAL_SUBREDDITS = ["ollama", "openai", "ai", "llama3"];

export default function Home() {
  const [subreddits, setSubreddits] = useState(["ollama", "openai"]);

  const handleAddSubreddit = (newSubreddit: string) => {
    if (!subreddits.includes(newSubreddit)) {
      setSubreddits([...subreddits, newSubreddit]);
    }
  };

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