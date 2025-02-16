import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

interface AddSubredditModalProps {
  onAddSubreddit: (subreddit: string) => void;
}

export function AddSubredditModal({ onAddSubreddit }: AddSubredditModalProps) {
  const [subredditUrl, setSubredditUrl] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subredditName = subredditUrl.split("/r/")[1]?.split("/")[0];
    if (subredditName) {
      onAddSubreddit(subredditName);
      setSubredditUrl("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Subreddit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subreddit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Paste Reddit URL (e.g., https://reddit.com/r/ollama)"
            value={subredditUrl}
            onChange={(e) => setSubredditUrl(e.target.value)}
          />
          <Button type="submit">Add</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 