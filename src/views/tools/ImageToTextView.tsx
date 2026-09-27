/**
 * ImageToTextView — dynamic import wrapper.
 *
 * tesseract.js loads a WASM engine that cannot be bundled by Next.js at
 * build time. Using next/dynamic with ssr: false defers the entire module
 * to the client at runtime, bypassing the bundler.
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
