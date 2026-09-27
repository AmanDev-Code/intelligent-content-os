"use client";

/**
 * ImageToTextView — dynamic import wrapper (Client Component).
 *
 * tesseract.js loads a WASM engine that cannot be bundled by Next.js at
 * build time. Using next/dynamic with ssr: false defers the entire module
 * to the client at runtime, bypassing the bundler.
 * Must be a Client Component ("use client") — next/dynamic ssr:false is not
 * allowed in Server Components.
 */
import dynamic from "next/dynamic";

const ImageToTextView = dynamic(
  () => import("./image-to-text/ImageToTextView"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        Loading OCR engine…
      </div>
    ),
  }
);

export default ImageToTextView;
