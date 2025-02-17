import { NextResponse } from "next/server";
import { PostController } from "@/controllers/PostController";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  
  try {
    const postController = new PostController();
    const posts = await postController.getSubredditPosts(name);
    return NextResponse.json(posts);
  } catch (error) {
    console.error(`[Posts API] Error fetching posts:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' }, 
      { status: 500 }
    );
  }
} 