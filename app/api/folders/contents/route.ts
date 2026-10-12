import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parentId = request.nextUrl.searchParams.get("parentId");
    const isValidParentId =
      parentId !== null &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        parentId,
      );
    if (!isValidParentId) {
      return NextResponse.json(
        { error: "A valid parentId is required" },
        { status: 400 },
      );
    }

    const [folder] = await db
      .select({ id: files.id, name: files.name })
      .from(files)
      .where(
        and(
          eq(files.id, parentId),
          eq(files.userId, userId),
          eq(files.isFolder, true),
          eq(files.isTrash, false),
        ),
      );

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const childFiles = await db
      .select({
        id: files.id,
        name: files.name,
        size: files.size,
        type: files.type,
        fileUrl: files.fileUrl,
        isFolder: files.isFolder,
        isStarred: files.isStarred,
      })
      .from(files)
      .where(
        and(
          eq(files.userId, userId),
          eq(files.parentId, folder.id),
          eq(files.isTrash, false),
        ),
      );

    return NextResponse.json({ folder, files: childFiles });
  } catch (error) {
    console.error("Error fetching folder contents:", error);
    return NextResponse.json(
      { error: "Failed to fetch folder contents" },
      { status: 500 },
    );
  }
}
