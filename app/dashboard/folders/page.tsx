import { FoldersTable } from "@/components/folders-table";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function FoldersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const folders = await db
    .select({
      id: files.id,
      name: files.name,
      size: files.size,
      type: files.type,
      isStarred: files.isStarred,
    })
    .from(files)
    .where(
      and(
        eq(files.userId, userId),
        eq(files.isFolder, true),
        eq(files.isTrash, false),
      ),
    );

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Folders</h1>
        <p className="text-sm text-muted-foreground">
          Folders in your account.
        </p>
      </div>

      <FoldersTable folders={folders} />
    </main>
  );
}
