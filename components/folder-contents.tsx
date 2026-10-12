"use client";

import { useEffect, useState } from "react";
import { FoldersTable } from "@/components/folders-table";

type FolderItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  fileUrl: string;
  isFolder: boolean;
  isStarred: boolean;
};

type FolderContentsResponse = {
  folder: { id: string; name: string };
  files: FolderItem[];
};

function isFolderContentsResponse(
  result: unknown,
): result is FolderContentsResponse {
  if (
    typeof result !== "object" ||
    result === null ||
    !("folder" in result) ||
    !("files" in result)
  ) {
    return false;
  }

  const folder = result.folder;
  return (
    typeof folder === "object" &&
    folder !== null &&
    "id" in folder &&
    typeof folder.id === "string" &&
    "name" in folder &&
    typeof folder.name === "string" &&
    Array.isArray(result.files) &&
    result.files.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        typeof item.id === "string" &&
        "name" in item &&
        typeof item.name === "string" &&
        "size" in item &&
        typeof item.size === "number" &&
        "type" in item &&
        typeof item.type === "string" &&
        "fileUrl" in item &&
        typeof item.fileUrl === "string" &&
        "isFolder" in item &&
        typeof item.isFolder === "boolean" &&
        "isStarred" in item &&
        typeof item.isStarred === "boolean",
    )
  );
}

export function FolderContents({ folderId }: { folderId: string }) {
  const [contents, setContents] = useState<FolderContentsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFolderContents() {
      setContents(null);
      setError(null);

      try {
        const response = await fetch(
          `/api/folders?parentId=${encodeURIComponent(folderId)}`,
          { signal: controller.signal },
        );
        const result: unknown = await response.json();

        if (!response.ok) {
          const message =
            typeof result === "object" &&
            result !== null &&
            "error" in result &&
            typeof result.error === "string"
              ? result.error
              : "Could not load folder contents.";
          throw new Error(message);
        }

        if (!isFolderContentsResponse(result)) {
          throw new Error("The folder contents response was invalid.");
        }

        setContents(result);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load folder contents.",
          );
        }
      }
    }

    void loadFolderContents();

    return () => controller.abort();
  }, [folderId]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {contents?.folder.name ?? "Folder"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Files and folders in this folder.
        </p>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : contents ? (
        <FoldersTable folders={contents.files} />
      ) : (
        <p className="text-sm text-muted-foreground" role="status">
          Loading folder contents...
        </p>
      )}
    </main>
  );
}
