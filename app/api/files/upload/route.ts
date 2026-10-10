import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import ImageKit from "@imagekit/nodejs";
import { error } from "console";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { tr } from "zod/v4/locales";

const client: any = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData(); // parse form data
    const file = formData.get("file") as File;
    const formUserId = formData.get("userId") as string;
    const formParentId = (formData.get("parentId") as string) || null;

    if (formUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 401 });
    }

    if (formParentId) {
      await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.id, formParentId),
            eq(files.userId, formUserId),
            eq(files.isFolder, true),
          ),
        );
    }

    if (!formParentId) {
      return NextResponse.json(
        { error: "No parent folder found" },
        { status: 401 },
      );
    }

    if (file.type !== "image/" && file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only file of type images and pdf are supported" },
        { status: 400 },
      );
    }

    // imagekit requires a buffer to be passed to it
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    const originalFilename = file.name;
    const fileExtension = originalFilename.split(".").pop() || "";
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;

    // Create folder path based on parent folder if exists
    const folderPath = formParentId
      ? `/dropbox/${userId}/folders/${formParentId}`
      : `/dropbox/${userId}`;

    const uploadResponse = await client.upload({
      file: fileBuffer,
      fileName: uniqueFilename,
      folder: folderPath,
      useUniqueFileName: false,
    });
    const fileData = {
      name: originalFilename,
      path: uploadResponse.filePath,
      size: file.size,
      type: file.type,
      fileUrl: uploadResponse.url,
      thumbnailUrl: uploadResponse.thumbnailUrl || null,
      userId: userId,
      parentId: formParentId,
      isFolder: false,
      isStarred: false,
      isTrash: false,
    };

    const [newFile] = await db.insert(files).values(fileData).returning();

    return NextResponse.json(newFile);
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
