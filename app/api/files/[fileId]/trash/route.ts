import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteProps = {
  params: Promise<{ fileId: string }>;
};

async function getOwnedDescendantIds(userId: string, rootId: string) {
  const entries = await db
    .select({ id: files.id, parentId: files.parentId })
    .from(files)
    .where(eq(files.userId, userId));
  const childrenByParent = new Map<string, string[]>();

  for (const entry of entries) {
    if (entry.parentId) {
      const children = childrenByParent.get(entry.parentId) ?? [];
      children.push(entry.id);
      childrenByParent.set(entry.parentId, children);
    }
  }

  const descendantIds = new Set<string>([rootId]);
  const pendingIds = [rootId];

  while (pendingIds.length > 0) {
    const parentId = pendingIds.pop()!;
    for (const childId of childrenByParent.get(parentId) ?? []) {
      if (!descendantIds.has(childId)) {
        descendantIds.add(childId);
        pendingIds.push(childId);
      }
    }
  }

  return [...descendantIds];
}

export async function PATCH(_request: Request, props: RouteProps) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await props.params;
    const [target] = await db
      .select({ id: files.id, isFolder: files.isFolder, isTrash: files.isTrash })
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    if (!target || !target.isTrash) {
      return NextResponse.json({ error: "Trashed item not found" }, { status: 404 });
    }

    const idsToRestore = target.isFolder
      ? await getOwnedDescendantIds(userId, target.id)
      : [target.id];

    const restoredFiles = await db
      .update(files)
      .set({ isTrash: false })
      .where(
        and(
          eq(files.userId, userId),
          eq(files.isTrash, true),
          inArray(files.id, idsToRestore),
        ),
      )
      .returning({ id: files.id });

    return NextResponse.json({
      success: true,
      id: target.id,
      restoredCount: restoredFiles.length,
    });
  } catch (error) {
    console.error("Error restoring trashed item:", error);
    return NextResponse.json(
      { error: "Failed to restore item" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, props: RouteProps) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await props.params;
    const [target] = await db
      .select({ id: files.id, isFolder: files.isFolder, isTrash: files.isTrash })
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    if (!target || !target.isTrash) {
      return NextResponse.json({ error: "Trashed item not found" }, { status: 404 });
    }

    const idsToDelete = target.isFolder
      ? await getOwnedDescendantIds(userId, target.id)
      : [target.id];

    const deletedFiles = await db
      .delete(files)
      .where(
        and(
          eq(files.userId, userId),
          eq(files.isTrash, true),
          inArray(files.id, idsToDelete),
        ),
      )
      .returning({ id: files.id });

    return NextResponse.json({
      success: true,
      id: target.id,
      deletedCount: deletedFiles.length,
    });
  } catch (error) {
    console.error("Error permanently deleting trashed item:", error);
    return NextResponse.json(
      { error: "Failed to permanently delete item" },
      { status: 500 },
    );
  }
}
