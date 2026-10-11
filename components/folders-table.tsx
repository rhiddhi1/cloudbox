"use client";

import { useState } from "react";
import { Star, StarOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FolderRow = {
  id: string;
  name: string;
  size: number;
  type: string;
  isStarred: boolean;
};

function getErrorMessage(result: unknown, fallback: string) {
  if (
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    typeof result.error === "string"
  ) {
    return result.error;
  }

  return fallback;
}

export function FoldersTable({ folders: initialFolders }: { folders: FolderRow[] }) {
  const [folders, setFolders] = useState(initialFolders);
  const [pendingFolderId, setPendingFolderId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function toggleStar(folder: FolderRow) {
    setPendingFolderId(folder.id);
    setActionError(null);

    try {
      const response = await fetch(`/api/files/${folder.id}/star`, {
        method: "PATCH",
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, "Could not update the star."));
      }

      if (
        typeof result !== "object" ||
        result === null ||
        !("isStarred" in result) ||
        typeof result.isStarred !== "boolean"
      ) {
        throw new Error("The star update response was invalid.");
      }

      setFolders((currentFolders) =>
        currentFolders.map((currentFolder) =>
          currentFolder.id === folder.id
            ? { ...currentFolder, isStarred: result.isStarred }
            : currentFolder,
        ),
      );
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not update the star.",
      );
    } finally {
      setPendingFolderId(null);
    }
  }

  async function moveToTrash(folder: FolderRow) {
    if (!window.confirm(`Move "${folder.name}" and its contents to trash?`)) {
      return;
    }

    setPendingFolderId(folder.id);
    setActionError(null);

    try {
      const response = await fetch(`/api/files/${folder.id}/delete`, {
        method: "POST",
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, "Could not delete the folder."));
      }

      setFolders((currentFolders) =>
        currentFolders.filter((currentFolder) => currentFolder.id !== folder.id),
      );
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not delete the folder.",
      );
    } finally {
      setPendingFolderId(null);
    }
  }

  return (
    <div className="space-y-3">
      {actionError && (
        <p className="text-sm text-destructive" role="alert">
          {actionError}
        </p>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {folders.length > 0 ? (
              folders.map((folder) => {
                const isPending = pendingFolderId === folder.id;

                return (
                  <TableRow key={folder.id}>
                    <TableCell className="font-medium">{folder.name}</TableCell>
                    <TableCell>{folder.size}</TableCell>
                    <TableCell>{folder.type}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {folder.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          aria-label={
                            folder.isStarred
                              ? `Unstar ${folder.name}`
                              : `Star ${folder.name}`
                          }
                          title={folder.isStarred ? "Unstar" : "Star"}
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          onClick={() => void toggleStar(folder)}
                        >
                          {folder.isStarred ? <StarOff /> : <Star />}
                        </Button>
                        <Button
                          aria-label={`Delete ${folder.name}`}
                          title="Move folder to trash"
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          onClick={() => void moveToTrash(folder)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={5}
                >
                  No folders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
