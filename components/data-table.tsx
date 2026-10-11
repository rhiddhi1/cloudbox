"use client";

import { useEffect, useState } from "react";
import { Download, Eye, Star, StarOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type RecentItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  fileUrl: string;
  isFolder: boolean;
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

export function DataTable({ data: initialData }: { data: RecentItem[] }) {
  const [data, setData] = useState(initialData);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  async function toggleStar(item: RecentItem) {
    setPendingItemId(item.id);
    setActionError(null);

    try {
      const response = await fetch(`/api/files/${item.id}/star`, {
        method: "PATCH",
      });
      const result: unknown = await response.json();
      const isStarred =
        typeof result === "object" && result !== null && "isStarred" in result
          ? result.isStarred
          : undefined;

      if (!response.ok) {
        throw new Error(getErrorMessage(result, "Could not update the star."));
      }

      if (typeof isStarred !== "boolean") {
        throw new Error("The star update response was invalid.");
      }

      setData((currentData) =>
        currentData.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, isStarred }
            : currentItem,
        ),
      );
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not update the star.",
      );
    } finally {
      setPendingItemId(null);
    }
  }

  async function moveToTrash(item: RecentItem) {
    setPendingItemId(item.id);
    setActionError(null);

    try {
      const response = await fetch(`/api/files/${item.id}/delete`, {
        method: "POST",
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, "Could not delete the item."));
      }

      setData((currentData) =>
        currentData.filter((currentItem) => currentItem.id !== item.id),
      );
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not delete the item.",
      );
    } finally {
      setPendingItemId(null);
    }
  }

  return (
    <div className="space-y-3 px-4 lg:px-6">
      <div>
        <h2 className="text-lg font-semibold">Recent items</h2>
        <p className="text-sm text-muted-foreground">
          Your most recently added files and folders.
        </p>
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
            {data.length > 0 ? (
              data.map((item) => {
                const isPending = pendingItemId === item.id;
                const downloadUrl = item.isFolder ? null : new URL(item.fileUrl);
                downloadUrl?.searchParams.set("ik-attachment", "true");

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{formatFileSize(item.size)}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {item.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {!item.isFolder && downloadUrl && (
                          <>
                            <Button
                              aria-label={`View ${item.name}`}
                              title="View"
                              variant="ghost"
                              size="icon"
                              nativeButton={false}
                              render={
                                <a
                                  href={item.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                />
                              }
                            >
                              <Eye />
                            </Button>
                            <Button
                              aria-label={`Download ${item.name}`}
                              title="Download"
                              variant="ghost"
                              size="icon"
                              nativeButton={false}
                              render={
                                <a
                                  href={downloadUrl.toString()}
                                  download={item.name}
                                />
                              }
                            >
                              <Download />
                            </Button>
                          </>
                        )}
                        <Button
                          aria-label={`${item.isStarred ? "Unstar" : "Star"} ${item.name}`}
                          title={item.isStarred ? "Unstar" : "Star"}
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          onClick={() => void toggleStar(item)}
                        >
                          {item.isStarred ? <StarOff /> : <Star />}
                        </Button>
                        <Button
                          aria-label={`Delete ${item.name}`}
                          title={item.isFolder ? "Move folder to trash" : "Move to trash"}
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          onClick={() => void moveToTrash(item)}
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
                  No recent items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
