import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const recentItems = await db
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
    .where(and(eq(files.userId, userId), eq(files.isTrash, false)))
    .orderBy(desc(files.createdAt))
    .limit(10);

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards userId={userId} />
        <DataTable data={recentItems} />
      </div>
    </div>
  );
}
