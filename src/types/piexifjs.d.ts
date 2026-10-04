declare module "piexifjs" {
  const piexif: {
    load: (dataUrl: string) => Record<string, unknown>;
    dump: (exifObj: Record<string, unknown>) => string;
    insert: (exifBytes: string, dataUrl: string) => string;
    ImageIFD: Record<string, number>;
    ExifIFD: Record<string, number>;
    GPSIFD: Record<string, number>;
  };
  export default piexif;
}
