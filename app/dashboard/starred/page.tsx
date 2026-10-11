import { StarredTable } from "@/components/starred-table";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function StarredPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const starredFiles = await db
    .select({
      id: files.id,
      name: files.name,
      size: files.size,
      type: files.type,
      fileUrl: files.fileUrl,
      isFolder: files.isFolder,
    })
    .from(files)
    .where(
      and(
        eq(files.userId, userId),
        eq(files.isStarred, true),
        eq(files.isTrash, false),
      ),
    );

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Starred</h1>
        <p className="text-sm text-muted-foreground">
          Your starred files and folders.
        </p>
      </div>
      <StarredTable files={starredFiles} />
    </main>
  );
}
