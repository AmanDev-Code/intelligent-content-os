/**
 * useFfmpeg — FFmpeg WASM lazy-loader hook.
 * Ported from iLoveMedia's useFfmpeg.ts (Vue → TypeScript React).
 * Loads @ffmpeg/ffmpeg lazily on first call so the ~33 MB core bundle
 * is never fetched on pages that don't need it.
 *
 * Note: @ffmpeg/util is not installed as a standalone package in this
 * version. fetchFile and toBlobURL are implemented inline below.
 */

import { useRef, useCallback, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FFmpegConvertOptions {
  /** Extra ffmpeg CLI arguments injected before the output filename. */
  extraArgs?: string[];
}

export interface FFmpegHook {
  load: () => Promise<void>;
  convert: (
    file: File,
    type: "audio" | "video",
    outputFormat: string,
    options?: FFmpegConvertOptions
  ) => Promise<File>;
  isLoaded: boolean;
  isProcessing: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Inline utilities (replaces @ffmpeg/util which is not installed)
// ---------------------------------------------------------------------------

/**
 * Fetches a resource and returns it as a Uint8Array suitable for
 * ffmpeg.writeFile(). Accepts File, Blob, URL string, or ArrayBuffer.
 */
async function fetchFile(source: File | Blob | string | ArrayBuffer): Promise<Uint8Array> {
  if (source instanceof File || source instanceof Blob) {
    const buf = await source.arrayBuffer();
    return new Uint8Array(buf);
  }
  if (source instanceof ArrayBuffer) {
    return new Uint8Array(source);
  }
  // URL string — fetch the remote resource.
  const res = await fetch(source);
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

/**
 * Fetches a URL and turns it into an object URL with the correct MIME type.
 * Needed so COOP/COEP-isolated pages can load the FFmpeg core without
 * triggering cross-origin restrictions.
 */
async function toBlobURL(url: string, mimeType: string): Promise<string> {
  const res = await fetch(url);
  const blob = new Blob([await res.arrayBuffer()], { type: mimeType });
  return URL.createObjectURL(blob);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useFfmpeg(): FFmpegHook {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Hold the FFmpeg instance across renders without triggering re-renders.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ffmpegRef = useRef<any>(null);

  const load = useCallback(async (): Promise<void> => {
    if (isLoaded || ffmpegRef.current) return;

    setError(null);

    try {
      // Lazy import — keeps the 33 MB WASM out of the initial bundle.
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");

      const ffmpeg = new FFmpeg();

      ffmpeg.on("log", ({ message }: { message: string }) => {
        if (process.env.NODE_ENV !== "production") {
          console.debug("[FFmpeg]", message);
        }
      });

      ffmpeg.on("progress", ({ progress: p }: { progress: number }) => {
        setProgress(Math.round(p * 100));
      });

      // Load core + wasm from unpkg via blob URLs so COOP/COEP-isolated pages
      // can fetch them without hitting cross-origin restrictions.
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      ffmpegRef.current = ffmpeg;
      setIsLoaded(true);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to load FFmpeg. Check browser security settings.";
      setError(msg);
      console.error("[useFfmpeg] load failed:", err);
    }
  }, [isLoaded]);

  const convert = useCallback(
    async (
      file: File,
      type: "audio" | "video",
      outputFormat: string,
      options: FFmpegConvertOptions = {}
    ): Promise<File> => {
      // Auto-load if not yet ready.
      if (!ffmpegRef.current) {
        await load();
      }

      if (!ffmpegRef.current) {
        throw new Error("FFmpeg failed to initialise. Cannot convert file.");
      }

      setIsProcessing(true);
      setProgress(0);
      setError(null);

      const ffmpeg = ffmpegRef.current;
      const inputName = file.name;
      const outputName = `output.${outputFormat}`;

      try {
        // Write input to FFmpeg virtual filesystem.
        await ffmpeg.writeFile(inputName, await fetchFile(file));

        // Build exec args: optionally inject extra args before output filename.
        const execArgs = ["-i", inputName, ...(options.extraArgs ?? []), outputName];
        await ffmpeg.exec(execArgs);

        // Read result from the virtual filesystem.
        const raw = await ffmpeg.readFile(outputName);
        // readFile returns FileData = string | Uint8Array. We construct a fresh
        // ArrayBuffer via slice(0) and cast to satisfy TS 5.8's stricter
        // BlobPart typing (Uint8Array<ArrayBufferLike> ≠ BlobPart).
        let blobPart: BlobPart;
        if (raw instanceof Uint8Array) {
          // .slice() on the underlying buffer produces a pure ArrayBuffer.
          blobPart = raw.buffer.slice(0) as ArrayBuffer;
        } else {
          blobPart = raw as string;
        }

        const blob = new Blob([blobPart], { type: `${type}/${outputFormat}` });

        // Strip old extension, attach new one.
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const outputFile = new File([blob], `${baseName}.${outputFormat}`, {
          type: `${type}/${outputFormat}`,
          lastModified: Date.now(),
        });

        // Clean up virtual FS entries so they don't accumulate.
        try {
          await ffmpeg.deleteFile(inputName);
          await ffmpeg.deleteFile(outputName);
        } catch {
          // Non-fatal — FS cleanup is best-effort.
        }

        return outputFile;
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Conversion failed. Check browser resource limits.";
        setError(msg);
        console.error("[useFfmpeg] convert failed:", err);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [load]
  );

  const reset = useCallback((): void => {
    setProgress(0);
    setError(null);
  }, []);

  return {
    load,
    convert,
    isLoaded,
    isProcessing,
    progress,
    error,
    reset,
  };
}
