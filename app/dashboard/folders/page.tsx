import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    })
    .from(files)
    .where(and(eq(files.userId, userId), eq(files.isFolder, true)));

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Folders</h1>
        <p className="text-sm text-muted-foreground">
          Folders in your account.
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {folders.length > 0 ? (
              folders.map((folder) => (
                <TableRow key={folder.id}>
                  <TableCell className="font-medium">{folder.name}</TableCell>
                  <TableCell>{folder.size}</TableCell>
                  <TableCell>{folder.type}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {folder.id}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={4}
                >
                  No folders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
