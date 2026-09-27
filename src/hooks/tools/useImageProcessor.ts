/**
 * useImageProcessor — Canvas API image processing engine.
 * Ported from iLoveIMG's useImageProcessor.js (Vue → TypeScript React).
 * All logic is identical; only the reactivity layer has changed.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WatermarkConfig {
  type: "text" | "image";
  text?: string;
  watermarkImage?: string;
  position:
    | "top-left"
    | "top-center"
    | "top-right"
    | "center"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  opacity: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  size?: number;
}

export interface PipelineOptions {
  format?: string;
  quality?: number;
  resize?: {
    mode: "original" | "percentage" | "contain" | "exact";
    width?: number;
    height?: number;
    percentage?: number;
    maintainAspect?: boolean;
  };
  rotate?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  filters?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    hue?: number;
    blur?: number;
    grayscale?: number;
    sepia?: number;
  };
  backgroundColor?: string;
  preserveExif?: boolean;
}

export interface ImageMetadata {
  name: string;
  type: string;
  size: number;
  sizeLabel: string;
  width: number;
  height: number;
  megapixels: number;
  aspectRatio: number | null;
  orientation: "Landscape" | "Portrait";
}

export interface ImageProcessorHook {
  convertImage: (file: File, targetFormat: string, quality?: number) => Promise<File>;
  compressImage: (file: File, quality: number) => Promise<File>;
  resizeImage: (
    file: File,
    width: number,
    height: number,
    maintainAspect?: boolean
  ) => Promise<File>;
  rotateImage: (file: File, degrees: number) => Promise<File>;
  cropImage: (
    file: File,
    cropArea: { x: number; y: number; width: number; height: number }
  ) => Promise<File>;
  addWatermarkToImage: (file: File, config: WatermarkConfig) => Promise<File>;
  processPipeline: (file: File, options: PipelineOptions) => Promise<File>;
  extractMetadata: (file: File) => Promise<ImageMetadata>;
  downloadFile: (file: File) => void;
  downloadFiles: (files: File[]) => void;
  formatFileSizeLabel: (bytes: number) => string;
}

// ---------------------------------------------------------------------------
// HEIC lazy-load singleton
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let libheifInstance: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let libheifLoading: Promise<any> | null = null;

const loadLibheif = async () => {
  if (libheifInstance) return libheifInstance;
  if (libheifLoading) return libheifLoading;

  libheifLoading = (async () => {
    // Use new Function to prevent Next.js from attempting to bundle
    // this at build time. The file lives in /public/wasm/libheif.mjs
    // and is served as a static asset — it must be loaded at runtime only.
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const dynamicImport = new Function("path", "return import(path)");
    const module = await dynamicImport("/wasm/libheif.mjs");
    libheifInstance = await module.default();
    return libheifInstance;
  })();

  return libheifLoading;
};

// ---------------------------------------------------------------------------
// Pure helpers (no React state needed — hook returns stable callbacks)
// ---------------------------------------------------------------------------

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const formatFileSizeLabel = (bytes = 0): string => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = Math.round((bytes / Math.pow(k, i)) * 100) / 100;
  return `${value} ${sizes[i]}`;
};

const heicMimeTypes = ["image/heic", "image/heif"];
const heicExtensionRegex = /\.(heic|heif)$/i;

const convertHeicToProcessable = async (file: File): Promise<File> => {
  const isHeic =
    heicMimeTypes.includes(file.type?.toLowerCase()) ||
    heicExtensionRegex.test(file.name || "");

  if (!isHeic) return file;

  try {
    const libheif = await loadLibheif();
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new libheif.HeifDecoder();
    const images = decoder.decode(new Uint8Array(arrayBuffer));

    if (!images || images.length === 0) {
      throw new Error("No images found in HEIC file");
    }

    const image = images[0];
    const width: number = image.get_width();
    const height: number = image.get_height();

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.createImageData(width, height);

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("HEIC decode timeout")), 30000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      image.display(imageData, (displayData: any) => {
        clearTimeout(timeout);
        if (!displayData) {
          reject(new Error("HEIF processing error"));
        } else {
          resolve();
        }
      });
    });

    ctx.putImageData(imageData, 0, 0);

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png")
    );

    return new File([blob], file.name.replace(heicExtensionRegex, ".png"), {
      type: "image/png",
      lastModified: Date.now(),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to convert HEIC file: ${msg}`);
  }
};

const prepareFileForCanvas = async (file: File): Promise<File> => {
  if (!(file instanceof File)) return file;
  return convertHeicToProcessable(file);
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target!.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const createImageFromSource = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const normalizeFormat = (format: string | undefined, fallbackType?: string): string => {
  if (!format && fallbackType) return fallbackType.split("/")[1];
  if (!format) return "png";
  const normalized = format.replace(".", "").toLowerCase();
  if (normalized === "jpg") return "jpeg";
  return normalized;
};

const normalizeQuality = (quality: number | undefined): number => {
  if (quality === undefined || quality === null) return 0.92;
  if (quality > 1) return clamp(quality / 100, 0.05, 1);
  return clamp(quality, 0.05, 1);
};

const formatSupportsAlpha = (format: string): boolean =>
  !["jpeg", "jpg", "bmp"].includes(format);

const canvasToFile = (
  canvas: HTMLCanvasElement,
  filename: string,
  mimeType: string,
  quality = 0.92
): Promise<File> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to process image"));
          return;
        }
        resolve(new File([blob], filename, { type: mimeType, lastModified: Date.now() }));
      },
      mimeType,
      quality
    );
  });

const buildFilterString = (filters: PipelineOptions["filters"] = {}): string => {
  const {
    brightness = 100,
    contrast = 100,
    saturation = 100,
    hue = 0,
    blur = 0,
    grayscale = 0,
    sepia = 0,
  } = filters;

  return [
    `brightness(${clamp(brightness, 0, 300) / 100})`,
    `contrast(${clamp(contrast, 0, 300) / 100})`,
    `saturate(${clamp(saturation, 0, 300) / 100})`,
    `hue-rotate(${clamp(hue, -180, 180)}deg)`,
    `blur(${clamp(blur, 0, 50)}px)`,
    `grayscale(${clamp(grayscale, 0, 100) / 100})`,
    `sepia(${clamp(sepia, 0, 100) / 100})`,
  ].join(" ");
};

const calculateResizeDimensions = (
  img: HTMLImageElement,
  resizeOptions: PipelineOptions["resize"]
): { width: number; height: number } => {
  const mode = resizeOptions?.mode || "original";

  if (mode === "percentage") {
    const percentage = clamp((resizeOptions?.percentage ?? 100), 1, 500) / 100;
    return {
      width: Math.round(img.width * percentage),
      height: Math.round(img.height * percentage),
    };
  }

  const targetWidth = resizeOptions?.width ?? img.width;
  const targetHeight = resizeOptions?.height ?? img.height;

  if (mode === "contain") {
    const ratio = Math.min(targetWidth / img.width, targetHeight / img.height);
    const safeRatio = ratio === Infinity ? 1 : ratio;
    return {
      width: Math.round(img.width * safeRatio),
      height: Math.round(img.height * safeRatio),
    };
  }

  if (mode === "exact") {
    if (resizeOptions?.maintainAspect) {
      const ratio = Math.min(targetWidth / img.width, targetHeight / img.height);
      const safeRatio = ratio === Infinity ? 1 : ratio;
      return {
        width: Math.round(img.width * safeRatio),
        height: Math.round(img.height * safeRatio),
      };
    }
    return { width: Math.round(targetWidth), height: Math.round(targetHeight) };
  }

  return { width: img.width, height: img.height };
};

const getCanvasSizeForRotation = (
  width: number,
  height: number,
  rotation: number
): { width: number; height: number } => {
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  return {
    width: Math.round(width * cos + height * sin),
    height: Math.round(width * sin + height * cos),
  };
};

// ---------------------------------------------------------------------------
// Watermark position lookup
// ---------------------------------------------------------------------------

type WatermarkPos = { x: number; y: number };
const getWatermarkPosition = (
  position: WatermarkConfig["position"],
  canvasWidth: number,
  canvasHeight: number,
  offsetX = 50,
  offsetY = 50
): WatermarkPos => {
  const positions: Record<WatermarkConfig["position"], WatermarkPos> = {
    "top-left": { x: offsetX, y: offsetY },
    "top-center": { x: canvasWidth / 2, y: offsetY },
    "top-right": { x: canvasWidth - offsetX, y: offsetY },
    center: { x: canvasWidth / 2, y: canvasHeight / 2 },
    "bottom-left": { x: offsetX, y: canvasHeight - offsetY },
    "bottom-center": { x: canvasWidth / 2, y: canvasHeight - offsetY },
    "bottom-right": { x: canvasWidth - offsetX, y: canvasHeight - offsetY },
  };
  return positions[position] ?? positions["bottom-right"];
};

// ---------------------------------------------------------------------------
// Core operations
// ---------------------------------------------------------------------------

const convertImage = async (
  file: File,
  targetFormat: string,
  quality = 0.92
): Promise<File> => {
  const safeFile = await prepareFileForCanvas(file);
  const dataUrl = await readFileAsDataUrl(safeFile);
  const img = await createImageFromSource(dataUrl);

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const normalizedFormat = normalizeFormat(targetFormat);
  const mimeType = `image/${normalizedFormat}`;
  const newName = file.name.replace(/\.[^/.]+$/, `.${normalizedFormat}`);

  return canvasToFile(canvas, newName, mimeType, quality);
};

const compressImage = async (file: File, quality: number): Promise<File> => {
  const format = file.type.split("/")[1] || "jpeg";
  return convertImage(file, format, normalizeQuality(quality));
};

const resizeImage = async (
  file: File,
  width: number,
  height: number,
  maintainAspect = true
): Promise<File> => {
  const safeFile = await prepareFileForCanvas(file);
  const dataUrl = await readFileAsDataUrl(safeFile);
  const img = await createImageFromSource(dataUrl);

  const canvas = document.createElement("canvas");
  if (maintainAspect) {
    const ratio = Math.min(width / img.width, height / img.height);
    canvas.width = Math.round(img.width * ratio);
    canvas.height = Math.round(img.height * ratio);
  } else {
    canvas.width = width;
    canvas.height = height;
  }

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvasToFile(canvas, file.name, safeFile.type, 0.92);
};

const rotateImage = async (file: File, degrees: number): Promise<File> => {
  const safeFile = await prepareFileForCanvas(file);
  const dataUrl = await readFileAsDataUrl(safeFile);
  const img = await createImageFromSource(dataUrl);

  const canvas = document.createElement("canvas");
  if (degrees === 90 || degrees === 270) {
    canvas.width = img.height;
    canvas.height = img.width;
  } else {
    canvas.width = img.width;
    canvas.height = img.height;
  }

  const ctx = canvas.getContext("2d")!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  return canvasToFile(canvas, file.name, safeFile.type, 0.92);
};

const cropImage = async (
  file: File,
  cropArea: { x: number; y: number; width: number; height: number }
): Promise<File> => {
  const safeFile = await prepareFileForCanvas(file);
  const dataUrl = await readFileAsDataUrl(safeFile);
  const img = await createImageFromSource(dataUrl);

  const canvas = document.createElement("canvas");
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    img,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height
  );

  return canvasToFile(canvas, file.name, safeFile.type, 0.92);
};

const addWatermarkToImage = async (
  file: File,
  watermarkConfig: WatermarkConfig
): Promise<File> => {
  const safeFile = await prepareFileForCanvas(file);
  const dataUrl = await readFileAsDataUrl(safeFile);
  const img = await createImageFromSource(dataUrl);

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  ctx.globalAlpha = watermarkConfig.opacity;

  if (watermarkConfig.type === "text" && watermarkConfig.text) {
    ctx.font = `${watermarkConfig.fontSize ?? 24}px ${watermarkConfig.fontFamily ?? "Arial"}`;
    ctx.fillStyle = watermarkConfig.color ?? "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const pos = getWatermarkPosition(
      watermarkConfig.position,
      canvas.width,
      canvas.height
    );
    ctx.fillText(watermarkConfig.text, pos.x, pos.y);
    ctx.globalAlpha = 1;
    return canvasToFile(canvas, file.name, safeFile.type, 0.92);
  }

  if (watermarkConfig.type === "image" && watermarkConfig.watermarkImage) {
    const wmImg = await createImageFromSource(watermarkConfig.watermarkImage);
    const wmWidth = watermarkConfig.size ?? 100;
    const wmHeight = (wmImg.height / wmImg.width) * wmWidth;
    const pos = getWatermarkPosition(
      watermarkConfig.position,
      canvas.width,
      canvas.height,
      20,
      20
    );
    ctx.drawImage(wmImg, pos.x, pos.y, wmWidth, wmHeight);
    ctx.globalAlpha = 1;
    return canvasToFile(canvas, file.name, safeFile.type, 0.92);
  }

  ctx.globalAlpha = 1;
  return canvasToFile(canvas, file.name, safeFile.type, 0.92);
};

const processPipeline = async (file: File, options: PipelineOptions = {}): Promise<File> => {
  const dataUrl = await readFileAsDataUrl(await prepareFileForCanvas(file));
  const img = await createImageFromSource(dataUrl);

  const { width, height } = calculateResizeDimensions(img, options.resize);
  const rotation = options.rotate ?? 0;
  const canvasSize = getCanvasSizeForRotation(width, height, rotation);

  const canvas = document.createElement("canvas");
  canvas.width = canvasSize.width;
  canvas.height = canvasSize.height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const format = normalizeFormat(
    options.format,
    file.type || `image/${file.name.split(".").pop()}`
  );

  const bg = options.backgroundColor;
  if (bg && bg !== "transparent") {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (!formatSupportsAlpha(format)) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.filter = buildFilterString(options.filters);
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  const scaleX = options.flipHorizontal ? -1 : 1;
  const scaleY = options.flipVertical ? -1 : 1;
  ctx.scale(scaleX, scaleY);
  ctx.drawImage(img, -width / 2, -height / 2, width, height);

  const mimeType = `image/${format}`;
  const extension = format === "jpeg" ? "jpg" : format;
  const outputName = file.name.replace(/\.[^/.]+$/, `.${extension}`);
  const quality = normalizeQuality(options.quality);

  return canvasToFile(canvas, outputName, mimeType, quality);
};

const extractMetadata = async (file: File): Promise<ImageMetadata> => {
  const dataUrl = await readFileAsDataUrl(await prepareFileForCanvas(file));
  const img = await createImageFromSource(dataUrl);
  const pixelCount = img.width * img.height;
  const ratio = img.height ? img.width / img.height : 0;

  return {
    name: file.name,
    type: file.type || `image/${file.name.split(".").pop()}`,
    size: file.size,
    sizeLabel: formatFileSizeLabel(file.size),
    width: img.width,
    height: img.height,
    megapixels: Number((pixelCount / 1_000_000).toFixed(2)),
    aspectRatio: ratio ? Number(ratio.toFixed(2)) : null,
    orientation: img.width >= img.height ? "Landscape" : "Portrait",
  };
};

const downloadFile = (file: File): void => {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const downloadFiles = (files: File[]): void => {
  files.forEach((file, index) => {
    setTimeout(() => downloadFile(file), index * 100);
  });
};

// ---------------------------------------------------------------------------
// Hook — returns stable function references (no state needed at this level)
// ---------------------------------------------------------------------------

export function useImageProcessor(): ImageProcessorHook {
  return {
    convertImage,
    compressImage,
    resizeImage,
    rotateImage,
    cropImage,
    addWatermarkToImage,
    processPipeline,
    extractMetadata,
    downloadFile,
    downloadFiles,
    formatFileSizeLabel,
  };
}
