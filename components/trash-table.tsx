"use client";

import { useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { formatFileSize } from "@/lib/format-file-size";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TrashedEntry = {
  id: string;
  name: string;
  size: number;
  type: string;
  isFolder: boolean;
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

export function TrashTable({ files: initialFiles }: { files: TrashedEntry[] }) {
  const [files, setFiles] = useState(initialFiles);
  const [isEmptying, setIsEmptying] = useState(false);
  const [isEmptyDialogOpen, setIsEmptyDialogOpen] = useState(false);
  const [pendingFileId, setPendingFileId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function restore(file: TrashedEntry) {
    setPendingFileId(file.id);
    setActionError(null);

    try {
      const response = await fetch(`/api/files/${file.id}/trash`, {
        method: "PATCH",
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, "Could not restore the item."));
      }

      setFiles((currentFiles) =>
        currentFiles.filter((currentFile) => currentFile.id !== file.id),
      );
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not restore the item.",
      );
    } finally {
      setPendingFileId(null);
    }
  }

  async function permanentlyDelete(file: TrashedEntry) {
    const label = file.isFolder ? "folder and all its contents" : "file";
    if (
      !window.confirm(
        `Permanently delete this ${label}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setPendingFileId(file.id);
    setActionError(null);

    try {
      const response = await fetch(`/api/files/${file.id}/trash`, {
        method: "DELETE",
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(result, "Could not permanently delete the item."),
        );
      }

      setFiles((currentFiles) =>
        currentFiles.filter((currentFile) => currentFile.id !== file.id),
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Could not permanently delete the item.",
      );
    } finally {
      setPendingFileId(null);
    }
  }

  async function emptyTrash() {
    setIsEmptying(true);
    setActionError(null);

    try {
      const response = await fetch("/api/files/empty-trash", {
        method: "DELETE",
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, "Could not empty the trash."));
      }

      setFiles([]);
      setIsEmptyDialogOpen(false);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not empty the trash.",
      );
    } finally {
      setIsEmptying(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <AlertDialog
          open={isEmptyDialogOpen}
          onOpenChange={(open) => setIsEmptyDialogOpen(open)}
        >
          <Button
            variant="destructive"
            onClick={() => setIsEmptyDialogOpen(true)}
            disabled={
              isEmptying || files.length === 0 || pendingFileId !== null
            }
          >
            <Trash2 />
            Empty trash
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Empty trash?</AlertDialogTitle>
              <AlertDialogDescription>
                Permanently delete every item in trash? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEmptyDialogOpen(false)}
                disabled={isEmptying}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => void emptyTrash()}
                disabled={isEmptying}
              >
                {isEmptying ? "Emptying..." : "Delete forever"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
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
            {files.length > 0 ? (
              files.map((file) => {
                const isPending = pendingFileId === file.id || isEmptying;

                return (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>{file.type}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {file.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          aria-label={`Restore ${file.name}`}
                          title="Restore"
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          onClick={() => void restore(file)}
                        >
                          <RotateCcw />
                        </Button>
                        <Button
                          aria-label={`Permanently delete ${file.name}`}
                          title="Delete forever"
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          onClick={() => void permanentlyDelete(file)}
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
                  Trash is empty.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
