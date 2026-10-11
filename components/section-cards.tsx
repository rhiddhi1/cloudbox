"use client";

import { useState, type FormEvent } from "react";
import { upload } from "@imagekit/next";
import { useRouter } from "next/navigation";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderPlusIcon, UploadIcon } from "lucide-react";

type SectionCardsProps = {
  userId: string;
};

export function SectionCards({ userId }: SectionCardsProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);
  const [folderSuccess, setFolderSuccess] = useState(false);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadError(null);
    setUploadSuccess(false);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setUploadError("Choose a file to upload.");
      return;
    }

    setIsUploading(true);

    try {
      const authResponse = await fetch("/api/imagekit-auth");
      const authData: unknown = await authResponse.json();
      if (!authResponse.ok) {
        const message =
          typeof authData === "object" &&
          authData !== null &&
          "error" in authData &&
          typeof authData.error === "string"
            ? authData.error
            : "Could not authorize the file upload.";
        throw new Error(message);
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
        const message =
          typeof savedFile === "object" &&
          savedFile !== null &&
          "error" in savedFile &&
          typeof savedFile.error === "string"
            ? savedFile.error
            : "Could not save the uploaded file.";
        throw new Error(message);
      }

      form.reset();
      setUploadSuccess(true);
      router.refresh();
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "File upload failed.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleCreateFolder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFolderError(null);
    setFolderSuccess(false);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name");
    if (typeof name !== "string" || name.trim() === "") {
      setFolderError("Enter a folder name.");
      return;
    }

    setIsCreatingFolder(true);

    try {
      const response = await fetch("/api/folders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), userId }),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Could not create the folder.";
        throw new Error(message);
      }

      form.reset();
      setFolderSuccess(true);
      router.refresh();
    } catch (error) {
      setFolderError(
        error instanceof Error ? error.message : "Folder creation failed.",
      );
    } finally {
      setIsCreatingFolder(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
      <Card>
        <CardHeader>
          <UploadIcon
            className="mb-2 size-5 text-muted-foreground"
            aria-hidden="true"
          />
          <CardTitle>Upload file</CardTitle>
          <CardDescription>Select a file to upload.</CardDescription>
        </CardHeader>
        <form
          onSubmit={handleUpload}
          className="flex flex-col gap-4 px-6 pb-6"
        >
          <input
            aria-label="File to upload"
            className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:font-medium file:text-primary-foreground"
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
          {uploadSuccess && (
            <p className="text-sm text-muted-foreground" role="status">
              File uploaded and saved.
            </p>
          )}
          <button
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            disabled={isUploading}
            type="submit"
          >
            {isUploading ? "Uploading..." : "Upload file"}
          </button>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <FolderPlusIcon
            className="mb-2 size-5 text-muted-foreground"
            aria-hidden="true"
          />
          <CardTitle>Create folder</CardTitle>
          <CardDescription>Choose a name for your new folder.</CardDescription>
        </CardHeader>
        <form
          onSubmit={handleCreateFolder}
          className="flex flex-col gap-4 px-6 pb-6"
        >
          <input
            aria-label="Folder name"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            name="name"
            placeholder="Folder name"
            required
            type="text"
            disabled={isCreatingFolder}
          />
          {folderError && (
            <p className="text-sm text-destructive" role="alert">
              {folderError}
            </p>
          )}
          {folderSuccess && (
            <p className="text-sm text-muted-foreground" role="status">
              Folder created.
            </p>
          )}
          <button
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            disabled={isCreatingFolder}
            type="submit"
          >
            {isCreatingFolder ? "Creating..." : "Create folder"}
          </button>
        </form>
      </Card>
    </div>
  );
}
