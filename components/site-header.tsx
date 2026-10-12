"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type FolderBreadcrumb = {
  id: string;
  name: string;
};

function isFolderBreadcrumbs(result: unknown): result is FolderBreadcrumb[] {
  return (
    Array.isArray(result) &&
    result.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        typeof item.id === "string" &&
        "name" in item &&
        typeof item.name === "string",
    )
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [folderPath, setFolderPath] = useState<FolderBreadcrumb[]>([]);
  const folderRouteMatch = pathname.match(/^\/dashboard\/folders\/([^/]+)$/);
  const folderId = folderRouteMatch?.[1];

  useEffect(() => {
    if (!folderId) {
      setFolderPath([]);
      return;
    }

    const activeFolderId = folderId;
    const controller = new AbortController();

    async function loadFolderPath() {
      setFolderPath([]);
      try {
        const response = await fetch(
          `/api/folders/contents?parentId=${encodeURIComponent(activeFolderId)}`,
          { signal: controller.signal },
        );
        const result: unknown = await response.json();
        const breadcrumbs =
          typeof result === "object" &&
          result !== null &&
          "folderPath" in result
            ? result.folderPath
            : null;

        if (!response.ok || !isFolderBreadcrumbs(breadcrumbs)) {
          throw new Error("Could not load folder breadcrumb.");
        }

        setFolderPath(breadcrumbs);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error loading folder breadcrumb:", error);
          setFolderPath([]);
        }
      }
    }

    void loadFolderPath();

    return () => controller.abort();
  }, [folderId]);

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = folderId
    ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Folders", href: "/dashboard/folders" },
        ...(folderPath.length > 0
          ? folderPath.map((folder) => ({
              label: folder.name,
              href: `/dashboard/folders/${folder.id}`,
            }))
          : [{ label: "Folder", href: `/dashboard/folders/${folderId}` }]),
      ]
    : segments.map((segment, index) => ({
        label:
          segment === "dashboard"
            ? "Dashboard"
            : decodeURIComponent(segment)
                .replace(/[-_]/g, " ")
                .replace(/\b\w/g, (character) => character.toUpperCase()),
        href: `/${segments.slice(0, index + 1).join("/")}`,
      }));

  return (
    <header className="sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => (
              <Fragment key={breadcrumb.href}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link href={breadcrumb.href} />}>
                      {breadcrumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto shrink-0">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
