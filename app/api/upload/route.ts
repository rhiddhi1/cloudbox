import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json();

    const {
      ImageKit,
      userId: clientUserId,
      parentId = null,
    } = body;

    if (userId !== clientUserId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    if (
      parentId !== null &&
      (typeof parentId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          parentId,
        ))
    ) {
      return NextResponse.json(
        { error: "Invalid parent folder" },
        { status: 400 },
      );
    }

    if (!ImageKit || !ImageKit.url)
      return NextResponse.json(
        { error: "Invalid file upload data" },
        { status: 400 },
      );

    if (parentId) {
      const [parentFolder] = await db
        .select({ id: files.id })
        .from(files)
        .where(
          and(
            eq(files.id, parentId),
            eq(files.userId, userId),
            eq(files.isFolder, true),
            eq(files.isTrash, false),
          ),
        );

      if (!parentFolder) {
        return NextResponse.json(
          { error: "Parent folder not found" },
          { status: 404 },
        );
      }
    }

    const fileData = {
      name: ImageKit.name,
      path: ImageKit.path,
      size: ImageKit.size,
      type: ImageKit.type,
      fileUrl: ImageKit.url,
      thumbnailUrl: ImageKit.thumbnail_url,
      userId: userId,
      parentId,
      isFolder: false,
      isStarred: false,
      isTrash: false,
    };

    const [newfile] = await db.insert(files).values(fileData).returning();

    return NextResponse.json(newfile);
  } catch (error) {
    console.error("Error: ", error);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}
