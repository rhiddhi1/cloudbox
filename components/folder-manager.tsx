"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FoldersTable, type FolderRow } from "@/components/folders-table";

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

function isFolderRow(value: unknown): value is FolderRow {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "size" in value &&
    typeof value.size === "number" &&
    "type" in value &&
    typeof value.type === "string" &&
    "fileUrl" in value &&
    typeof value.fileUrl === "string" &&
    "isFolder" in value &&
    value.isFolder === true &&
    "isStarred" in value &&
    typeof value.isStarred === "boolean"
  );
}

export function FolderManager({
  folders: initialFolders,
  userId,
}: {
  folders: FolderRow[];
  userId: string;
}) {
  const router = useRouter();
  const [folders, setFolders] = useState(initialFolders);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFolders(initialFolders);
  }, [initialFolders]);

  async function createFolder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name");
    if (typeof name !== "string" || name.trim() === "") {
      setError("Enter a folder name.");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/folders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          userId,
          parentId: null,
        }),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(result, "Could not create the folder."),
        );
      }

      const folder =
        typeof result === "object" && result !== null && "folder" in result
          ? result.folder
          : null;
      if (!isFolderRow(folder)) {
        throw new Error("The folder creation response was invalid.");
      }

      setFolders((currentFolders) => [...currentFolders, folder]);
      form.reset();
      setIsDialogOpen(false);
      router.refresh();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Folder creation failed.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Folders</h1>
          <p className="text-sm text-muted-foreground">
            Folders in your account.
          </p>
        </div>
        <Dialog.Root
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (open) setError(null);
          }}
        >
          <Dialog.Trigger
            render={
              <Button>
                Create folder
              </Button>
            }
          />
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
            <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 text-foreground shadow-lg outline-none">
              <div className="space-y-1">
                <Dialog.Title className="text-lg font-semibold">
                  Create folder
                </Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">
                  Enter a name for your new folder.
                </Dialog.Description>
              </div>
              <form className="space-y-4" onSubmit={createFolder}>
                <Input
                  aria-label="Folder name"
                  autoFocus
                  name="name"
                  placeholder="Folder name"
                  required
                  disabled={isCreating}
                />
                {error && (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <Dialog.Close
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isCreating}
                      >
                        Cancel
                      </Button>
                    }
                  />
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
      <FoldersTable folders={folders} />
    </>
  );
}
