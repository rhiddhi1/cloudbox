import { FolderContents } from "@/components/folder-contents";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function FolderPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { folderId } = await params;

  return <FolderContents folderId={folderId} userId={userId} />;
}
