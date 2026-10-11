"use client";

import { useState } from "react";
import {
  Download,
  Eye,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type FileRow = {
  id: string;
  name: string;
  size: number;
  fileUrl: string;
  isStarred: boolean;
};

type FilesTableProps = {
  files: FileRow[];
};

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

export function FilesTable({ files: initialFiles }: FilesTableProps) {
  const [files, setFiles] = useState(initialFiles);
  const [pendingFileId, setPendingFileId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function toggleStar(fileId: string) {
    setPendingFileId(fileId);
    setActionError(null);

    try {
      const response = await fetch(`/api/files/${fileId}/star`, {
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

      setFiles((currentFiles) =>
        currentFiles.map((file) =>
          file.id === fileId
            ? { ...file, isStarred: result.isStarred }
            : file,
        ),
      );
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not update the star.",
      );
    } finally {
      setPendingFileId(null);
    }
  }

  async function moveToTrash(fileId: string) {
    setPendingFileId(fileId);
    setActionError(null);

    try {
      const response = await fetch(`/api/files/${fileId}/delete`, {
        method: "POST",
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, "Could not delete the file."));
      }

      setFiles((currentFiles) =>
        currentFiles.filter((file) => file.id !== fileId),
      );
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not delete the file.",
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
              <TableHead>ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.length > 0 ? (
              files.map((file) => {
                const isPending = pendingFileId === file.id;
                const downloadUrl = new URL(file.fileUrl);
                downloadUrl.searchParams.set("ik-attachment", "true");

                return (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {file.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
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
                        <Button
                          aria-label={
                            file.isStarred
                              ? `Unstar ${file.name}`
                              : `Star ${file.name}`
                          }
                          title={file.isStarred ? "Unstar" : "Star"}
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          onClick={() => void toggleStar(file.id)}
                        >
                          {file.isStarred ? <StarOff /> : <Star />}
                        </Button>
                        <Button
                          aria-label={`Delete ${file.name}`}
                          title="Move to trash"
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          onClick={() => void moveToTrash(file.id)}
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
                  colSpan={4}
                >
                  No files found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
