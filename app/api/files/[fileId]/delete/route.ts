import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  props: { params: Promise<{ fileId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await props.params;
    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 },
      );
    }

    const [target] = await db
      .select({
        id: files.id,
        isFolder: files.isFolder,
        isTrash: files.isTrash,
      })
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    if (!target || target.isTrash) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    let idsToTrash = [target.id];

    if (target.isFolder) {
      const ownedEntries = await db
        .select({ id: files.id, parentId: files.parentId })
        .from(files)
        .where(eq(files.userId, userId));
      const childrenByParent = new Map<string, string[]>();

      for (const entry of ownedEntries) {
        if (entry.parentId) {
          const children = childrenByParent.get(entry.parentId) ?? [];
          children.push(entry.id);
          childrenByParent.set(entry.parentId, children);
        }
      }

      const descendants = new Set<string>([target.id]);
      const pendingFolderIds = [target.id];

      while (pendingFolderIds.length > 0) {
        const parentId = pendingFolderIds.pop()!;
        for (const childId of childrenByParent.get(parentId) ?? []) {
          if (!descendants.has(childId)) {
            descendants.add(childId);
            pendingFolderIds.push(childId);
          }
        }
      }

      idsToTrash = [...descendants];
    }

    const trashedEntries = await db
      .update(files)
      .set({ isTrash: true })
      .where(and(eq(files.userId, userId), inArray(files.id, idsToTrash)))
      .returning({ id: files.id });

    return NextResponse.json({
      success: true,
      id: target.id,
      trashedCount: trashedEntries.length,
    });
  } catch (error) {
    console.error("Error moving file to trash:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
