import { TrashTable } from "@/components/trash-table";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function TrashPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
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

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Trash</h1>
        <p className="text-sm text-muted-foreground">
          Restore items or permanently delete them.
        </p>
      </div>
      <TrashTable files={trashedFiles} />
    </main>
  );
}
