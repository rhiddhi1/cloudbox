"use client";

import { useState, type FormEvent } from "react";
import { upload } from "@imagekit/next";
import { Dialog } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export function FolderActions({
  folderId,
  userId,
  onItemCreated,
}: {
  folderId: string;
  userId: string;
  onItemCreated: () => void;
}) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [folderError, setFolderError] = useState<string | null>(null);

  async function uploadFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadError(null);

    const form = event.currentTarget;
    const file = new FormData(form).get("file");
    if (!(file instanceof File) || file.size === 0) {
      setUploadError("Choose a file to upload.");
      return;
    }

    setIsUploading(true);
    try {
      const authResponse = await fetch("/api/imagekit-auth");
      const authData: unknown = await authResponse.json();
      if (!authResponse.ok) {
        throw new Error(
          getErrorMessage(authData, "Could not authorize the file upload."),
        );
      }

      if (
        typeof authData !== "object" ||
        authData === null ||
        !("token" in authData) ||
        typeof authData.token !== "string" ||
        !("signature" in authData) ||
        typeof authData.signature !== "string" ||
        !("expire" in authData) ||
        typeof authData.expire !== "number" ||
        !("publicKey" in authData) ||
        typeof authData.publicKey !== "string"
      ) {
        throw new Error("The upload authorization response is invalid.");
      }

      const imageKitFile = await upload({
        file,
        fileName: file.name,
        token: authData.token,
        signature: authData.signature,
        expire: authData.expire,
        publicKey: authData.publicKey,
      });

      if (!imageKitFile.url || !imageKitFile.filePath) {
        throw new Error("ImageKit did not return a file URL and path.");
      }

      const saveResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          parentId: folderId,
          ImageKit: {
            name: file.name,
            path: imageKitFile.filePath,
            size: file.size,
            type: file.type || "application/octet-stream",
            url: imageKitFile.url,
            thumbnail_url: imageKitFile.thumbnailUrl,
          },
        }),
      });
      const savedFile: unknown = await saveResponse.json();
      if (!saveResponse.ok) {
        throw new Error(
          getErrorMessage(savedFile, "Could not save the uploaded file."),
        );
      }

      form.reset();
      setIsUploadOpen(false);
      onItemCreated();
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "File upload failed.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function createFolder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFolderError(null);

    const form = event.currentTarget;
    const name = new FormData(form).get("name");
    if (typeof name !== "string" || name.trim() === "") {
      setFolderError("Enter a folder name.");
      return;
    }

    setIsCreatingFolder(true);
    try {
      const response = await fetch("/api/folders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          userId,
          parentId: folderId,
        }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        throw new Error(
          getErrorMessage(result, "Could not create the folder."),
        );
      }

      form.reset();
      setIsCreateFolderOpen(false);
      onItemCreated();
    } catch (error) {
      setFolderError(
        error instanceof Error ? error.message : "Folder creation failed.",
      );
    } finally {
      setIsCreatingFolder(false);
    }
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Dialog.Root
        open={isUploadOpen}
        onOpenChange={(open) => {
          setIsUploadOpen(open);
          if (open) setUploadError(null);
        }}
      >
        <Dialog.Trigger render={<Button variant="outline">Upload file</Button>} />
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 text-foreground shadow-lg outline-none">
            <div className="space-y-1">
              <Dialog.Title className="text-lg font-semibold">
                Upload file
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                Choose a file to upload to this folder.
              </Dialog.Description>
            </div>
            <form className="space-y-4" onSubmit={uploadFile}>
              <Input
                aria-label="File to upload"
                name="file"
                required
                type="file"
                disabled={isUploading}
              />
              {uploadError && (
                <p className="text-sm text-destructive" role="alert">
                  {uploadError}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Dialog.Close
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                  }
                />
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root
        open={isCreateFolderOpen}
        onOpenChange={(open) => {
          setIsCreateFolderOpen(open);
          if (open) setFolderError(null);
        }}
      >
        <Dialog.Trigger render={<Button>Create folder</Button>} />
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 text-foreground shadow-lg outline-none">
            <div className="space-y-1">
              <Dialog.Title className="text-lg font-semibold">
                Create folder
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                Enter a name for the new folder.
              </Dialog.Description>
            </div>
            <form className="space-y-4" onSubmit={createFolder}>
              <Input
                aria-label="Folder name"
                autoFocus
                name="name"
                placeholder="Folder name"
                required
                disabled={isCreatingFolder}
              />
              {folderError && (
                <p className="text-sm text-destructive" role="alert">
                  {folderError}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Dialog.Close
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isCreatingFolder}
                    >
                      Cancel
                    </Button>
                  }
                />
                <Button type="submit" disabled={isCreatingFolder}>
                  {isCreatingFolder ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
