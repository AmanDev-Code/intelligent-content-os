/**
 * useFileDownload — single, multi, and ZIP download utilities.
 * Uses jszip + file-saver for multi-file archives.
 */

import JSZip from "jszip";
import { saveAs } from "file-saver";

export function useFileDownload() {
  const downloadSingle = (file: File): void => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadMultiple = (files: File[]): void => {
    files.forEach((file, index) => {
      setTimeout(() => downloadSingle(file), index * 150);
    });
  };

  const downloadAsZip = async (files: File[], zipName: string): Promise<void> => {
    const zip = new JSZip();
    const folder = zip.folder(zipName) ?? zip;
    for (const file of files) {
      folder.file(file.name, await file.arrayBuffer());
    }
    const content = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });
    saveAs(content, `${zipName}.zip`);
  };

  return { downloadSingle, downloadMultiple, downloadAsZip };
}
