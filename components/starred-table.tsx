"use client";

import { useState } from "react";
import { Download, Eye, StarOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type StarredEntry = {
  id: string;
  name: string;
  size: number;
  type: string;
  fileUrl: string;
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

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;

  const units = ["KB", "MB", "GB", "TB"];
  let value = size / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function StarredTable({
  files: initialFiles,
}: {
  files: StarredEntry[];
}) {
  const [files, setFiles] = useState(initialFiles);
  const [pendingFileId, setPendingFileId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function unstar(file: StarredEntry) {
    setPendingFileId(file.id);
    setActionError(null);

    try {
      const response = await fetch(`/api/files/${file.id}/star`, {
        method: "PATCH",
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, "Could not unstar the item."));
      }

      setFiles((currentFiles) =>
        currentFiles.filter((currentFile) => currentFile.id !== file.id),
      );
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not unstar the item.",
      );
    } finally {
      setPendingFileId(null);
    }
  }

  async function moveToTrash(file: StarredEntry) {
    setPendingFileId(file.id);
    setActionError(null);

    try {
      const response = await fetch(`/api/files/${file.id}/delete`, {
        method: "POST",
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, "Could not delete the item."));
      }

      setFiles((currentFiles) =>
        currentFiles.filter((currentFile) => currentFile.id !== file.id),
      );
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not delete the item.",
      );
    } finally {
      setPendingFileId(null);
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
            {files.length > 0 ? (
              files.map((file) => {
                const isPending = pendingFileId === file.id;
                const downloadUrl = file.isFolder
                  ? null
                  : new URL(file.fileUrl);
                downloadUrl?.searchParams.set("ik-attachment", "true");

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
                        {!file.isFolder && downloadUrl && (
                          <>
                            <Button
                              aria-label={`View ${file.name}`}
                              title="View"
                              variant="ghost"
                              size="icon"
                              render={
                                <a
                                  href={file.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                />
                              }
                            >
                              <Eye />
                            </Button>
                            <Button
                              aria-label={`Download ${file.name}`}
                              title="Download"
                              variant="ghost"
                              size="icon"
                              render={
                                <a
                                  href={downloadUrl.toString()}
                                  download={file.name}
                                />
                              }
                            >
                              <Download />
                            </Button>
                          </>
                        )}
                        <Button
                          aria-label={`Unstar ${file.name}`}
                          title="Unstar"
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          onClick={() => void unstar(file)}
                        >
                          <StarOff />
                        </Button>
                        <Button
                          aria-label={`Delete ${file.name}`}
                          title={file.isFolder ? "Move folder to trash" : "Move to trash"}
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          onClick={() => void moveToTrash(file)}
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
                  No starred files or folders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
