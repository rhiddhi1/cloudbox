import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
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

    const [trashedFile] = await db
      .update(files)
      .set({ isTrash: true })
      .where(
        and(
          eq(files.id, fileId),
          eq(files.userId, userId),
          eq(files.isFolder, false),
          eq(files.isTrash, false),
        ),
      )
      .returning({ id: files.id });

    if (!trashedFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: trashedFile.id });
  } catch (error) {
    console.error("Error moving file to trash:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
