import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifySearchEngines, slugify } from "@/lib/indexnow";

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: [{ publishedAt: "desc" }],
    });
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Blog GET error:", error);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, category, excerpt, content, coverImageUrl, authorName, authorRole, readTime, isPublished } = body;

    if (!title || !category || !excerpt || !content || !coverImageUrl || !authorName) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    const generatedSlug = slug || slugify(title);

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: generatedSlug,
        category,
        excerpt,
        content,
        coverImageUrl,
        authorName,
        authorRole: authorRole || "Fitness Coach",
        readTime: readTime || "5 min read",
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        publishedAt: new Date(),
      },
    });

    if (post.isPublished) notifySearchEngines([`/blog/${post.slug}`, "/blog", "/"]);
    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Blog POST error:", error);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data,
    });

    notifySearchEngines([`/blog/${post.slug}`, "/blog"]);
    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Blog PATCH error:", error);
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const removed = await prisma.blogPost.delete({ where: { id } });
    notifySearchEngines([`/blog/${removed.slug}`, "/blog"]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Blog DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
