import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json();

    const { ImageKit, userId: clientUserId } = body;

    if (userId !== clientUserId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    if (!ImageKit || !ImageKit.url)
      return NextResponse.json(
        { error: "Invalid file upload data" },
        { status: 400 },
      );

    const fileData = {
      name: ImageKit.name,
      path: ImageKit.path,
      size: ImageKit.size,
      type: ImageKit.type,
      fileUrl: ImageKit.url,
      thumbnailUrl: ImageKit.thumbnail_url,
      userId: userId,
      parentId: null,
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
