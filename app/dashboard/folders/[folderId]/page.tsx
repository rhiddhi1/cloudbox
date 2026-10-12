import { FolderContents } from "@/components/folder-contents";

export default async function FolderPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await params;

  return <FolderContents folderId={folderId} />;
}
