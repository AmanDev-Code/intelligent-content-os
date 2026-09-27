"use client";

/**
 * ImageDropzone — drag-drop + click-to-browse file upload component.
 * Shadcn primitives: Badge.
 * Design tokens: --background, --foreground, --card, --muted,
 *   --muted-foreground, --primary, --border, --destructive,
 *   --destructive-foreground, --ring.
 * Icons: Lucide only.
 * Accessible: keyboard-navigable, ARIA live regions, visible focus ring.
 */

import React, { useCallback, useRef, useState } from "react";
import { Upload, X, FileImage, FileAudio, FileVideo, File as FileIcon } from "lucide-react";
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

function getFileTypeBadge(mimeType: string): string {
  const parts = mimeType.split("/");
  return (parts[1] ?? parts[0] ?? "file").toUpperCase();
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
      // Reset input so the same file can be re-added after removal.
      if (inputRef.current) inputRef.current.value = "";
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
          // Base layout
          "relative flex cursor-pointer flex-col items-center justify-center rounded-lg",
          "border-2 border-dashed px-6 py-10 text-center transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
          // Default state
          "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]",
          // Drag-over state
          dragOver &&
            "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)] scale-[1.005]",
          // Disabled state
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
            "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
            "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]",
            dragOver && "bg-[hsl(var(--primary)/0.2)]"
          )}
          aria-hidden="true"
        >
          <Upload className="h-7 w-7" />
        </div>

        <p className="text-base font-semibold text-foreground">
          {dragOver ? "Drop to upload" : "Drop files here"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          or{" "}
          <span className="font-medium text-[hsl(var(--primary))] underline underline-offset-2">
            click to browse
          </span>
        </p>

        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 bg-[hsl(var(--muted))] rounded-full px-3 py-1">
          Max {maxSizeMB} MB · {accept.replace(/,/g, " · ")}
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

      {/* Selected file list */}
      {!isEmpty && (
        <ul
          className="space-y-2"
          aria-label={`Selected ${selectedFiles.length === 1 ? "file" : "files"}`}
        >
          {selectedFiles.map((file, i) => {
            const Icon = getFileIcon(file.type);
            const badge = getFileTypeBadge(file.type);
            return (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2.5"
              >
                <Icon
                  className="h-5 w-5 shrink-0 text-[hsl(var(--primary))]"
                  aria-hidden="true"
                />

                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {file.name}
                </span>

                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {badge}
                </Badge>

                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  disabled={disabled}
                  aria-label={`Remove ${file.name}`}
                  className={cn(
                    "ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    "text-muted-foreground transition-colors",
                    "hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1",
                    "disabled:pointer-events-none"
                  )}
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
