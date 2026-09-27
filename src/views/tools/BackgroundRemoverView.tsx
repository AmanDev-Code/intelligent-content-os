/**
 * BackgroundRemoverView — dynamic import wrapper.
 *
 * @imgly/background-removal → onnxruntime-web → .wasm files cannot be
 * bundled by Next.js at build time. Using next/dynamic with ssr: false
 * defers the entire module to the client at runtime, bypassing the bundler.
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
