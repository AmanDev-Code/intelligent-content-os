import { apiClient } from "@/lib/apiClient";

/** Raster types handled by `/media/upload` image pipeline (optimized to JPEG server-side). */
export const ACCEPT_IMAGE = "image/jpeg,image/png,image/gif,image/webp";

/** Accept all file types for admin uploads. */
export const ACCEPT_ALL_FILES = "*/*";

export function isAllowedImageFile(file: File): boolean {
  const t = file.type.toLowerCase();
  if (["image/jpeg", "image/png", "image/gif", "image/webp"].includes(t)) return true;
  const lower = file.name.toLowerCase();
  return /\.(jpe?g|png|gif|webp)$/i.test(lower);
}

/** Admin can upload any file type. */
export function isAllowedAdminFile(_file: File): boolean {
  return true;
}

/** Check if a file is an optimizable image type (for backend processing). */
export function isOptimizableImage(file: File): boolean {
  const t = file.type.toLowerCase();
  if (["image/jpeg", "image/png", "image/gif", "image/webp"].includes(t)) return true;
  const lower = file.name.toLowerCase();
  return /\.(jpe?g|png|gif|webp)$/i.test(lower);
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image via POST /media/upload (base64 JSON body).
 * Returns the public CDN/MinIO URL. Consumes media quota on the backend.
 */
export async function uploadImageFile(
  file: File,
  options?: { cmsPath?: string },
): Promise<string> {
  if (!isAllowedImageFile(file)) {
    throw new Error("Please choose an image file (JPEG, PNG, GIF, WebP).");
  }
  const image = await readFileAsDataURL(file);
  const body: Record<string, string> = {
    image,
    filename: file.name || "upload.jpg",
  };
  if (options?.cmsPath !== undefined) {
    body.cmsPath = options.cmsPath;
  }
  const res = (await apiClient.post("/media/upload", body)) as { url?: string };
  const url = res?.url;
  if (!url || typeof url !== "string") {
    throw new Error("Upload did not return a URL.");
  }
  return url;
}
