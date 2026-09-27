"use client";

/**
 * BackgroundRemoverView — dynamic import wrapper (Client Component).
 *
 * @imgly/background-removal → onnxruntime-web → .wasm files cannot be
 * bundled by Next.js at build time. Using next/dynamic with ssr: false
 * defers the entire module to the client at runtime, bypassing the bundler.
 * Must be a Client Component ("use client") — next/dynamic ssr:false is not
 * allowed in Server Components.
 */
import dynamic from "next/dynamic";

const BackgroundRemoverView = dynamic(
  () => import("./background-remover/BackgroundRemoverView"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        Loading background remover…
      </div>
    ),
  }
);

export default BackgroundRemoverView;
