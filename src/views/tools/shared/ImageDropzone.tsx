"use client";

/**
 * ImageDropzone — drag-drop + click-to-browse file upload component.
 * Shows image thumbnails with remove buttons when files are selected.
 *
 * Shadcn primitives: Badge.
 * Design tokens: --tool-surface-dim, --tool-border, --primary, --destructive.
 * Icons: Lucide only.
 * Accessible: keyboard-navigable, ARIA live regions, visible focus ring.
 */

import React, { useCallback, useRef, useState, useEffect } from "react";
import { Upload, X, Plus, FileImage, FileAudio, FileVideo, File as FileIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ImageDropzoneProps {
  accept: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.startsWith("audio/")) return FileAudio;
  if (mimeType.startsWith("video/")) return FileVideo;
  return FileIcon;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

// ---------------------------------------------------------------------------
// Thumbnail component
// ---------------------------------------------------------------------------

function FileThumbnail({
  file,
  onRemove,
  disabled,
}: {
  file: File;
  onRemove: () => void;
  disabled: boolean;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isImageFile(file)) return;
    const objUrl = URL.createObjectURL(file);
    setUrl(objUrl);
    return () => URL.revokeObjectURL(objUrl);
  }, [file]);

  return (
    <div className="group relative rounded-lg overflow-hidden border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface-dim))]">
      {/* Image preview */}
      {url ? (
        <img
          src={url}
          alt={file.name}
          className="h-16 w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="flex h-16 w-full items-center justify-center">
          <FileImage className="h-6 w-6 text-muted-foreground" aria-hidden />
        </div>
      )}

      {/* Remove button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        disabled={disabled}
        className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--destructive))] text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Remove ${file.name}`}
      >
        <X className="h-3 w-3" aria-hidden />
      </button>

      {/* File info */}
      <div className="px-1.5 py-1">
        <p className="truncate text-[9px] text-muted-foreground leading-tight">{file.name}</p>
        <p className="text-[9px] font-medium text-foreground/70">{formatBytes(file.size)}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ImageDropzone({
  accept,
  multiple = false,
  maxSizeMB = 50,
  onFilesSelected,
  disabled = false,
  className,
}: ImageDropzoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const addMoreRef = useRef<HTMLInputElement>(null);
  const maxBytes = maxSizeMB * 1024 * 1024;

  const processFileList = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const files = Array.from(fileList);

      const oversized = files.filter((f) => f.size > maxBytes);
      if (oversized.length > 0) {
        setSizeError(
          `${oversized.map((f) => f.name).join(", ")} ${
            oversized.length === 1 ? "exceeds" : "exceed"
          } the ${maxSizeMB} MB limit.`
        );
        return;
      }

      setSizeError(null);
      const next = multiple ? [...selectedFiles, ...files] : files;
      setSelectedFiles(next);
      onFilesSelected(next);
    },
    [maxBytes, maxSizeMB, multiple, onFilesSelected, selectedFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFileList(e.target.files);
      if (inputRef.current) inputRef.current.value = "";
    },
    [processFileList]
  );

  const handleAddMore = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFileList(e.target.files);
      if (addMoreRef.current) addMoreRef.current.value = "";
    },
    [processFileList]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      processFileList(e.dataTransfer.files);
    },
    [disabled, processFileList]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) setDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    [disabled]
  );

  const removeFile = useCallback(
    (index: number) => {
      const next = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(next);
      onFilesSelected(next);
      setSizeError(null);
    },
    [onFilesSelected, selectedFiles]
  );

  const isEmpty = selectedFiles.length === 0;
  const allImages = selectedFiles.length > 0 && selectedFiles.every(isImageFile);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Upload ${multiple ? "files" : "a file"}. Accepted formats: ${accept}. Maximum size: ${maxSizeMB} MB.`}
        aria-disabled={disabled}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-lg",
          "border-2 border-dashed px-5 py-6 text-center transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
          "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]",
          dragOver && "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)] scale-[1.005]",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />

        <div
          className={cn(
            "mb-3 flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
            "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]",
            dragOver && "bg-[hsl(var(--primary)/0.2)]"
          )}
          aria-hidden="true"
        >
          <Upload className="h-5 w-5" />
        </div>

        <p className="text-sm font-semibold text-foreground">
          {dragOver ? "Drop to upload" : "Drop files here"}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          or{" "}
          <span className="font-medium text-[hsl(var(--primary))] underline underline-offset-2">
            click to browse
          </span>
        </p>

        <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 bg-[hsl(var(--muted))] rounded-full px-2.5 py-0.5">
          {accept.replace(/image\//g, "").replace(/,/g, " · ").toUpperCase()} · Max {maxSizeMB} MB
        </p>
      </div>

      {/* Size error */}
      {sizeError && (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-md bg-[hsl(var(--destructive)/0.1)] px-3 py-2 text-sm font-medium text-[hsl(var(--destructive))]"
        >
          {sizeError}
        </p>
      )}

      {/* Thumbnail grid (for image files) */}
      {!isEmpty && allImages && (
        <div
          className="grid grid-cols-4 sm:grid-cols-6 gap-2"
          aria-label={`${selectedFiles.length} selected ${selectedFiles.length === 1 ? "file" : "files"}`}
        >
          {selectedFiles.map((file, i) => (
            <FileThumbnail
              key={`${file.name}-${file.size}-${i}`}
              file={file}
              onRemove={() => removeFile(i)}
              disabled={disabled}
            />
          ))}

          {/* Add more button */}
          {multiple && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); addMoreRef.current?.click(); }}
              disabled={disabled}
              className="flex h-[88px] items-center justify-center rounded-lg border-2 border-dashed border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface-dim))] text-muted-foreground transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Add more files"
            >
              <Plus className="h-6 w-6" aria-hidden />
            </button>
          )}

          {/* Hidden input for "add more" */}
          <input
            ref={addMoreRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleAddMore}
            disabled={disabled}
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      )}

      {/* Text file list (for non-image files) */}
      {!isEmpty && !allImages && (
        <ul
          className="space-y-2"
          aria-label={`Selected ${selectedFiles.length === 1 ? "file" : "files"}`}
        >
          {selectedFiles.map((file, i) => {
            const Icon = getFileIcon(file.type);
            return (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2.5"
              >
                <Icon className="h-5 w-5 shrink-0 text-[hsl(var(--primary))]" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{file.name}</span>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {(file.type.split("/")[1] ?? "file").toUpperCase()}
                </Badge>
                <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  disabled={disabled}
                  aria-label={`Remove ${file.name}`}
                  className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
