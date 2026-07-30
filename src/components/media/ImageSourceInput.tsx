"use client";

import {
  useCallback,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ImageIcon, Link2, Loader2, Upload, ClipboardPaste, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";
import {
  ACCEPT_IMAGE,
  uploadImageFile,
  isAllowedImageFile,
} from "./uploadImageFile";

export type ImageSourceInputProps = {
  /** Current image URL (field mode shows preview). */
  value: string;
  /** Called with a hosted HTTPS URL after upload or when the user applies a URL. */
  onChange: (url: string) => void;
  label?: string;
  /**
   * `field` — label, optional preview, and “Choose image”.
   * `trigger` — only the control that opens the dialog (e.g. Insert image).
   */
  mode?: "field" | "trigger";
  dialogTitle?: string;
  confirmLabel?: string;
  triggerClassName?: string;
  /** When set (platform admin only), uploads go under `media/cms/{path}/` via `/media/upload`. */
  uploadCmsPath?: string;
  /** Shown under the title in the dialog */
  dialogDescription?: string;
};

function looksLikeHttpUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function ImageSourceInput({
  value,
  onChange,
  label = "Image",
  mode = "field",
  dialogTitle = "Add image",
  confirmLabel = "Use image",
  triggerClassName,
  dialogDescription = "Upload a file, paste a URL, or paste an image from the clipboard. Uploads are stored on the platform media bucket.",
  uploadCmsPath,
}: ImageSourceInputProps) {
  const { toast } = useToast();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"upload" | "url" | "clipboard" | "browse">("upload");

  const [urlDraft, setUrlDraft] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [browseFiles, setBrowseFiles] = useState<Array<{ key: string; name: string; url: string; size?: number }>>([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseFetched, setBrowseFetched] = useState(false);

  const resetDialogState = useCallback(() => {
    setUrlDraft("");
    setSelectedUrl(null);
    setUploading(false);
    setDragOver(false);
    setTab("upload");
    setBrowseFiles([]);
    setBrowseFetched(false);
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetDialogState();
  };

  const processFile = async (file: File) => {
    if (!isAllowedImageFile(file)) {
      toast({
        title: "Invalid file",
        description: "Please use an image file.",
        variant: "destructive",
      });
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImageFile(file, {
        cmsPath: uploadCmsPath,
      });
      setSelectedUrl(url);
      toast({ title: "Uploaded" });
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

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) void processFile(f);
  };

  const onDropzoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void processFile(f);
  };

  const onPasteContainerPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items?.length) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file") {
        const f = item.getAsFile();
        if (f) {
          e.preventDefault();
          void processFile(f);
          return;
        }
      }
    }
  };

  const applyUrlFromInput = () => {
    const raw = urlDraft.trim();
    if (!raw) {
      toast({
        title: "URL required",
        description: "Enter an image URL.",
        variant: "destructive",
      });
      return;
    }
    if (!looksLikeHttpUrl(raw)) {
      toast({
        title: "Invalid URL",
        description: "Use a full URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }
    setSelectedUrl(raw);
  };

  const fetchBrowseFiles = useCallback(async () => {
    if (!uploadCmsPath || browseFetched) return;
    setBrowseLoading(true);
    try {
      const res = await apiClient.get("/admin/media/browse", {
        params: { path: uploadCmsPath, scope: "cms" },
      });
      const objects = (res.objects || []) as Array<{ key: string; name: string; url: string; size?: number }>;
      // Filter to image files only
      const images = objects.filter((o) =>
        /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(o.name),
      );
      setBrowseFiles(images);
    } catch {
      toast({ title: "Could not load existing images", variant: "destructive" });
    } finally {
      setBrowseLoading(false);
      setBrowseFetched(true);
    }
  }, [uploadCmsPath, browseFetched, toast]);

  const confirm = () => {
    const url = selectedUrl?.trim();
    if (!url) {
      toast({
        title: "No image selected",
        description: "Upload, paste a URL, or paste an image from the clipboard.",
        variant: "destructive",
      });
      return;
    }
    onChange(url);
    handleOpenChange(false);
  };

  const triggerButton: ReactNode =
    mode === "trigger" ? (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn("h-7 gap-1.5 rounded-full px-3 text-xs", triggerClassName)}
        onClick={() => handleOpenChange(true)}
      >
        <ImageIcon className="h-3.5 w-3.5" />
        {label}
      </Button>
    ) : null;

  return (
    <>
      {mode === "field" ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label>{label}</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0 text-xs"
              onClick={() => handleOpenChange(true)}
            >
              <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
              Choose image
            </Button>
          </div>
          {value ? (
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt=""
                className="h-12 w-12 shrink-0 rounded-md border border-border/60 object-cover"
              />
              <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground" title={value}>
                {value}
              </p>
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground">No image selected.</p>
          )}
        </div>
      ) : (
        triggerButton
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          nested
          className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
          onOpenAutoFocus={(e) => {
            if (tab === "clipboard") {
              e.preventDefault();
              pasteRef.current?.focus();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>

          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full">
            <TabsList className={cn("grid w-full", uploadCmsPath ? "grid-cols-4" : "grid-cols-3")}>
              <TabsTrigger value="upload" className="gap-1 text-xs sm:text-sm">
                <Upload className="h-3.5 w-3.5" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="url" className="gap-1 text-xs sm:text-sm">
                <Link2 className="h-3.5 w-3.5" />
                URL
              </TabsTrigger>
              <TabsTrigger value="clipboard" className="gap-1 text-xs sm:text-sm">
                <ClipboardPaste className="h-3.5 w-3.5" />
                Clipboard
              </TabsTrigger>
              {uploadCmsPath && (
                <TabsTrigger
                  value="browse"
                  className="gap-1 text-xs sm:text-sm"
                  onClick={() => { if (!browseFetched) void fetchBrowseFiles(); }}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  Browse
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="upload" className="space-y-3 pt-2">
              <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                accept={ACCEPT_IMAGE}
                className="sr-only"
                onChange={onFileInputChange}
              />
              <div
                role="button"
                tabIndex={0}
                className={cn(
                  "flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
                  dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                  uploading && "pointer-events-none opacity-60",
                )}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDrop={onDropzoneDrop}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload image file"
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                    <p className="text-sm font-medium">Drop an image here or click to browse</p>
                    <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG, GIF, WebP</p>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="image-url-paste">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="image-url-paste"
                    placeholder="https://example.com/image.jpg"
                    value={urlDraft}
                    onChange={(e) => setUrlDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyUrlFromInput();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={applyUrlFromInput}>
                    Apply
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Use a direct link to an image. HTTPS recommended.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="clipboard" className="space-y-3 pt-2">
              <div
                ref={pasteRef}
                tabIndex={0}
                role="region"
                aria-label="Paste image from clipboard"
                className={cn(
                  "flex min-h-[120px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-4 py-8 text-center outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
                  uploading && "pointer-events-none opacity-60",
                )}
                onPaste={onPasteContainerPaste}
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <ClipboardPaste className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">Click here, then paste (⌘V / Ctrl+V)</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Copied screenshots and images are uploaded to your media storage.
                    </p>
                  </>
                )}
              </div>
            </TabsContent>

            {uploadCmsPath && (
              <TabsContent value="browse" className="space-y-3 pt-2">
                {browseLoading ? (
                  <div className="flex min-h-[140px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : browseFiles.length === 0 ? (
                  <div className="flex min-h-[140px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-4 py-8 text-center">
                    <FolderOpen className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">No images found</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Upload images first — they will appear here for reuse.
                    </p>
                  </div>
                ) : (
                  <div className="grid max-h-[280px] grid-cols-3 gap-2 overflow-y-auto rounded-lg border border-border/40 p-2 sm:grid-cols-4">
                    {browseFiles.map((file) => (
                      <button
                        key={file.key}
                        type="button"
                        className={cn(
                          "group relative aspect-square overflow-hidden rounded-md border-2 transition-all",
                          selectedUrl === file.url
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-transparent hover:border-primary/40",
                        )}
                        onClick={() => setSelectedUrl(file.url)}
                        title={file.name}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={file.url}
                          alt={file.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1 pb-1 pt-4 opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="truncate text-[9px] text-white">{file.name}</p>
                        </div>
                        {selectedUrl === file.url && (
                          <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                            ✓
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>

          {selectedUrl ? (
            <div className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="text-xs font-medium text-foreground">Preview</p>
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedUrl}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-md border border-border/60 object-cover"
                />
                <p className="min-w-0 flex-1 break-all text-xs text-muted-foreground">{selectedUrl}</p>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirm} disabled={!selectedUrl || uploading}>
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
