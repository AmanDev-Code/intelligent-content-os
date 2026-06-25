"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  FolderPlus,
  Folder,
  FileIcon,
  Loader2,
  RefreshCw,
  Upload,
  Copy,
  Share2,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ACCEPT_IMAGE,
  isAllowedImageFile,
  readFileAsDataURL,
} from "@/components/media/uploadImageFile";

type BrowseFolder = { name: string; prefix: string };
type BrowseObject = {
  key: string;
  name: string;
  size: number;
  lastModified: string | null;
  contentType: string | null;
  url: string;
};

type BrowseResult = {
  scope?: "bucket" | "cms";
  bucket?: string;
  path: string;
  listingPrefix: string;
  folders: BrowseFolder[];
  objects: BrowseObject[];
};

/** Map folder `prefix` from the API to the browse `path` query for the current scope. */
function folderPrefixToBrowsePath(
  scope: "bucket" | "cms",
  folderPrefix: string,
): string {
  const normalized =
    folderPrefix.length > 0 && folderPrefix.endsWith("/")
      ? folderPrefix.slice(0, -1)
      : folderPrefix;
  if (scope === "cms") {
    const root = "media/cms";
    if (!normalized.startsWith(root)) return "";
    const suffix = normalized.slice(root.length);
    return suffix.startsWith("/") ? suffix.slice(1) : suffix;
  }
  return normalized;
}

function formatBytes(n: number): string {
  if (n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return `${parseFloat((n / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function rowKindLabel(contentType: string | null): string {
  if (!contentType) return "File";
  if (contentType.startsWith("image/")) return contentType;
  return contentType.split("/").pop() || "File";
}

const IMAGE_FILENAME_RE = /\.(jpe?g|png|gif|webp|svg|bmp|avif|ico|heic|heif)$/i;

function isBrowseImageObject(o: BrowseObject): boolean {
  const ct = o.contentType?.toLowerCase() ?? "";
  if (ct.startsWith("image/")) return true;
  return IMAGE_FILENAME_RE.test(o.name);
}

function MediaObjectThumbnail({
  url,
  name,
  isImage,
  onOpenPreview,
}: {
  url: string;
  name: string;
  isImage: boolean;
  onOpenPreview: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const showRaster = isImage && !imgFailed;

  if (!isImage) {
    return (
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border/80 bg-muted/30"
        aria-hidden
      >
        <FileIcon className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          title="View full image"
          className="relative flex h-11 w-11 shrink-0 cursor-zoom-in items-center justify-center overflow-hidden rounded-md border border-border/80 bg-muted/30 outline-none ring-offset-background transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={(e) => {
            e.stopPropagation();
            onOpenPreview();
          }}
          aria-label={`Open preview of ${name}`}
        >
          {showRaster ? (
            <img
              src={url}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <FileIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="z-[110]">
        Preview
      </TooltipContent>
    </Tooltip>
  );
}

export function AdminMediaBrowser() {
  const { toast } = useToast();
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [browseScope, setBrowseScope] = useState<"bucket" | "cms">("bucket");
  const [relativePath, setRelativePath] = useState("");
  const [data, setData] = useState<BrowseResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ key: string; label: string } | null>(
    null,
  );
  const [previewObject, setPreviewObject] = useState<BrowseObject | null>(null);

  const loadIdRef = useRef(0);

  const load = useCallback(async () => {
    const currentLoadId = ++loadIdRef.current;
    setLoading(true);
    try {
      const res = (await api.admin.mediaBrowse({
        path: relativePath || undefined,
        ...(browseScope === "cms" ? { scope: "cms" } : {}),
      })) as BrowseResult;
      if (loadIdRef.current === currentLoadId) {
        setData(res);
      }
    } catch (e: unknown) {
      if (loadIdRef.current === currentLoadId) {
        toast({
          title: "Could not load media",
          description: e instanceof Error ? e.message : "Request failed",
          variant: "destructive",
        });
        setData(null);
      }
    } finally {
      if (loadIdRef.current === currentLoadId) {
        setLoading(false);
      }
    }
  }, [relativePath, browseScope, toast]);

  useEffect(() => {
    setRelativePath("");
  }, [browseScope]);

  useEffect(() => {
    void load();
  }, [load]);

  const rootCrumbLabel =
    browseScope === "cms"
      ? "media/cms"
      : data?.bucket
        ? data.bucket
        : "Bucket root";

  const breadcrumbs = useMemo(() => {
    const segments = relativePath.split("/").filter(Boolean);
    const crumbs: { label: string; path: string }[] = [
      { label: rootCrumbLabel, path: "" },
    ];
    let acc = "";
    for (const seg of segments) {
      acc = acc ? `${acc}/${seg}` : seg;
      crumbs.push({ label: seg, path: acc });
    }
    return crumbs;
  }, [relativePath, rootCrumbLabel]);

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "URL copied" });
    } catch {
      toast({
        title: "Copy failed",
        variant: "destructive",
      });
    }
  };

  const shareUrl = async (url: string) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ url, title: "Media URL" });
        return;
      } catch {
        /* fall through */
      }
    }
    await copyUrl(url);
  };

  const openFolder = (folderPrefix: string) => {
    const next = folderPrefixToBrowsePath(browseScope, folderPrefix);
    setRelativePath(next);
  };

  const goBreadcrumb = (path: string) => {
    setRelativePath(path);
  };

  const parentPath = useMemo(() => {
    const parts = relativePath.split("/").filter(Boolean);
    if (parts.length === 0) return null;
    parts.pop();
    return parts.join("/");
  }, [relativePath]);

  const processUploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!isAllowedImageFile(file)) {
          toast({
            title: "Skipped",
            description: `${file.name} is not a supported image type.`,
            variant: "destructive",
          });
          continue;
        }
        const image = await readFileAsDataURL(file);
        await api.admin.mediaUpload({
          image,
          filename: file.name || "upload.jpg",
          path: data?.listingPrefix || undefined,
          fullPath: true,
        });
      }
      toast({ title: "Upload complete" });
      await load();
    } catch (e: unknown) {
      toast({
        title: "Upload failed",
        description: e instanceof Error ? e.message : "Could not upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const confirmCreateFolder = async () => {
    const name = folderName.trim();
    if (!name) {
      toast({ title: "Folder name required", variant: "destructive" });
      return;
    }
    try {
      await api.admin.mediaCreateFolder({
        path: data?.listingPrefix || undefined,
        name,
        fullPath: true,
      });
      toast({ title: "Folder created" });
      setFolderOpen(false);
      setFolderName("");
      await load();
    } catch (e: unknown) {
      toast({
        title: "Could not create folder",
        description: e instanceof Error ? e.message : "Request failed",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.admin.mediaDeleteObject(deleteTarget.key);
      toast({ title: "Deleted" });
      setDeleteTarget(null);
      await load();
    } catch (e: unknown) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Request failed",
        variant: "destructive",
      });
    }
  };

  const combinedRows: Array<
    | { kind: "folder"; folder: BrowseFolder }
    | { kind: "file"; object: BrowseObject }
  > = useMemo(() => {
    if (!data) return [];
    const f = data.folders.map((folder) => ({ kind: "folder" as const, folder }));
    const o = data.objects.map((object) => ({ kind: "file" as const, object }));
    return [...f, ...o];
  }, [data]);

  return (
    <TooltipProvider delayDuration={400}>
      <div className="w-full space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight">Media</h1>
            <p className="text-sm text-muted-foreground">
              Browse the whole MinIO bucket (default) or restrict to{" "}
              <code className="text-xs">media/cms/</code>. Admin has full access to upload, create folders, and delete anywhere.
            </p>
          </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={browseScope === "bucket" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setBrowseScope("bucket")}
          >
            Full bucket
          </Button>
          <Button
            type="button"
            variant={browseScope === "cms" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setBrowseScope("cms")}
          >
            CMS only
          </Button>
          <input
            ref={uploadInputRef}
            type="file"
            accept={ACCEPT_IMAGE}
            multiple
            className="sr-only"
            onChange={(e) => void processUploadFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => uploadInputRef.current?.click()}
            className="gap-1.5"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setFolderOpen(true)}
          >
            <FolderPlus className="h-4 w-4" />
            New folder
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={loading}
            onClick={() => void load()}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <nav
        className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
        aria-label="Breadcrumb"
      >
        {breadcrumbs.map((c, i) => (
          <span key={c.path} className="flex items-center gap-1">
            {i > 0 ? <ChevronRight className="h-3.5 w-3.5 shrink-0" /> : null}
            <button
              type="button"
              className={cn(
                "hover:text-foreground rounded px-1 py-0.5",
                i === breadcrumbs.length - 1 && "text-foreground font-medium",
              )}
              onClick={() => goBreadcrumb(c.path)}
            >
              {c.label}
            </button>
          </span>
        ))}
      </nav>

      {parentPath !== null ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => goBreadcrumb(parentPath)}
        >
          ← Up one level
        </Button>
      ) : null}

      <div className="rounded-md border border-border/60">
        {loading && !data ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : combinedRows.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            This folder is empty. Upload images or create a folder.
          </div>
        ) : (
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-14 shrink-0">
                  <span className="sr-only">Preview</span>
                </TableHead>
                <TableHead className="min-w-0">Name</TableHead>
                <TableHead className="text-muted-foreground w-[min(12rem,20%)]">
                  Type
                </TableHead>
                <TableHead className="text-muted-foreground whitespace-nowrap">Size</TableHead>
                <TableHead className="text-muted-foreground min-w-0">Modified</TableHead>
                <TableHead className="min-w-[148px] w-[148px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {combinedRows.map((row) =>
                row.kind === "folder" ? (
                  <TableRow key={row.folder.prefix}>
                    <TableCell className="align-middle py-2">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border/80 bg-muted/20"
                        aria-hidden
                      >
                        <Folder className="h-4 w-4 shrink-0 text-amber-600/90" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        className="flex items-center gap-2 text-left font-medium text-primary hover:underline"
                        onClick={() => openFolder(row.folder.prefix)}
                      >
                        {row.folder.name}
                      </button>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">Folder</TableCell>
                    <TableCell className="text-muted-foreground">—</TableCell>
                    <TableCell className="text-muted-foreground">—</TableCell>
                    <TableCell
                      className="min-w-[148px] w-[148px] text-right align-middle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() =>
                                setDeleteTarget({
                                  key: row.folder.prefix.endsWith("/")
                                    ? row.folder.prefix
                                    : `${row.folder.prefix}/`,
                                  label: row.folder.name,
                                })
                              }
                              aria-label={`Delete folder ${row.folder.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="z-[110]">
                            Delete marker
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  (() => {
                    const obj = row.object;
                    const imageRow = isBrowseImageObject(obj);
                    return (
                      <TableRow
                        key={obj.key}
                        className={cn(imageRow && "cursor-pointer hover:bg-muted/40")}
                        onClick={(e) => {
                          if (!imageRow) return;
                          const el = e.target as HTMLElement;
                          if (el.closest("button, a")) return;
                          setPreviewObject(obj);
                        }}
                      >
                        <TableCell className="align-middle py-2">
                          <MediaObjectThumbnail
                            url={obj.url}
                            name={obj.name}
                            isImage={imageRow}
                            onOpenPreview={() => setPreviewObject(obj)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="min-w-0">
                            <span className="truncate font-medium" title={obj.key}>
                              {obj.name}
                            </span>
                            <p
                              className="mt-0.5 truncate text-[10px] text-muted-foreground"
                              title={obj.key}
                            >
                              {obj.key}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {rowKindLabel(obj.contentType)}
                        </TableCell>
                        <TableCell className="text-sm tabular-nums">{formatBytes(obj.size)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {obj.lastModified
                            ? new Date(obj.lastModified).toLocaleString()
                            : "—"}
                        </TableCell>
                        <TableCell
                          className="min-w-[148px] w-[148px] text-right align-middle"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex flex-wrap justify-end gap-0.5">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => void copyUrl(obj.url)}
                                  aria-label="Copy URL"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="z-[110]">
                                Copy URL
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => void shareUrl(obj.url)}
                                  aria-label="Share"
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="z-[110]">
                                Share
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() =>
                                    setDeleteTarget({ key: obj.key, label: obj.name })
                                  }
                                  aria-label={`Delete ${obj.name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="z-[110]">
                                Delete
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })()
                ),
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Public URLs follow <code className="text-[10px]">MINIO_PUBLIC_URL</code> / bucket / key
        (same pattern as the rest of the app). Image uploads use the same credit cost as{" "}
        <Link href="/admin/content-engine?tab=articles" className="underline underline-offset-2">
          Content Engine
        </Link>{" "}
        uploads (~0.5 credits).
      </p>

      <Dialog open={folderOpen} onOpenChange={setFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New folder</DialogTitle>
            <DialogDescription>
              Creates an empty prefix <code className="text-xs">name/</code> in the current directory
              {data?.listingPrefix ? ` (${data.listingPrefix})` : " (bucket root)"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="admin-media-folder-name">Folder name</Label>
            <Input
              id="admin-media-folder-name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. blog-covers"
              onKeyDown={(e) => {
                if (e.key === "Enter") void confirmCreateFolder();
              }}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFolderOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void confirmCreateFolder()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the object from storage. Empty a folder of files first; only the
              folder marker is deleted here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={previewObject !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewObject(null);
        }}
      >
        <DialogContent
          overlayClassName="z-[100] bg-black/90"
          className={cn(
            "z-[100] flex max-h-[90vh] w-[min(96vw,1400px)] max-w-[min(96vw,1400px)] gap-0 overflow-hidden border border-white/10 bg-zinc-950 p-0 text-foreground shadow-2xl sm:rounded-lg",
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {previewObject ? (
            <>
              <DialogTitle className="sr-only">{previewObject.name}</DialogTitle>
              <DialogDescription className="sr-only">
                Full-size preview. Press Escape to close.
              </DialogDescription>
              <div className="flex max-h-[calc(90vh-4.25rem)] min-h-0 w-full items-center justify-center overflow-auto p-3 sm:p-5">
                {isBrowseImageObject(previewObject) ? (
                  <img
                    src={previewObject.url}
                    alt={previewObject.name}
                    className="max-h-[calc(90vh-5.5rem)] w-auto max-w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 py-8 text-zinc-400">
                    <FileIcon className="h-12 w-12" />
                    <p className="text-sm">No image preview for this file type.</p>
                  </div>
                )}
              </div>
              <DialogFooter className="flex flex-row flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-black/50 px-4 py-3 sm:justify-between">
                <span className="min-w-0 truncate text-left text-sm text-zinc-200">
                  {previewObject.name}
                </span>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => void copyUrl(previewObject.url)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy URL
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-white/20 bg-transparent text-zinc-100 hover:bg-white/10 hover:text-white"
                    onClick={() => void shareUrl(previewObject.url)}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </Button>
                </div>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  );
}
