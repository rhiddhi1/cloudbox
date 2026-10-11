import { FilesTable } from "@/components/files-table";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function FilesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const userFiles = await db
    .select({
      id: files.id,
      name: files.name,
      size: files.size,
      fileUrl: files.fileUrl,
      isStarred: files.isStarred,
    })
    .from(files)
    .where(
      and(
        eq(files.userId, userId),
        eq(files.isFolder, false),
        eq(files.isTrash, false),
      ),
    );

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Files</h1>
        <p className="text-sm text-muted-foreground">
          Files in your account.
        </p>
      </div>
      <FilesTable files={userFiles} />
    </main>
  );
}
