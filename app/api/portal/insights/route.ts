import { NextRequest, NextResponse } from "next/server";
import { portalStore, type InsightPost } from "@/lib/server/portal-store";
import { getWorkspaceSession } from "@/lib/workspace-auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";
  const posts = all ? portalStore.getAllInsightPosts() : portalStore.getInsightPosts();
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const session = getWorkspaceSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const now = new Date().toISOString();
  const post: InsightPost = {
    id: `ip_${Date.now()}`,
    category: body.category ?? "세무 칼럼",
    title: body.title,
    content: body.content ?? "",
    summary: body.summary ?? body.content?.slice(0, 80) ?? "",
    audience: body.audience ?? "전체 공지",
    authorName: session.name,
    authorRole: session.roleKey,
    targetIndustry: body.targetIndustry,
    isDraft: body.isDraft ?? false,
    publishedAt: body.isDraft ? undefined : now,
    createdAt: now,
  };

  portalStore.addInsightPost(post);
  return NextResponse.json({ post }, { status: 201 });
}
