import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trashedFiles = await db
      .select({
        id: files.id,
        name: files.name,
        size: files.size,
        type: files.type,
        isFolder: files.isFolder,
      })
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrash, true)));

    return NextResponse.json(trashedFiles);
  } catch (error) {
    console.error("Error fetching trash:", error);
    return NextResponse.json(
      { error: "Failed to fetch trash" },
      { status: 500 },
    );
  }
}
