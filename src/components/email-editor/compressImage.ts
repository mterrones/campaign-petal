export const TEMPLATE_IMAGE_MAX_BYTES = 400 * 1024;
const MAX_EDGE_PX = 1600;

function dataUrlByteLength(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  const b64 = comma === -1 ? dataUrl : dataUrl.slice(comma + 1);
  return Math.floor((b64.length * 3) / 4);
}

export async function compressImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("NOT_AN_IMAGE");
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("NO_CANVAS");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  if (file.type === "image/png") {
    const png = canvas.toDataURL("image/png");
    if (dataUrlByteLength(png) <= TEMPLATE_IMAGE_MAX_BYTES) return png;
  }

  for (const quality of [0.8, 0.6, 0.45]) {
    const jpeg = canvas.toDataURL("image/jpeg", quality);
    if (dataUrlByteLength(jpeg) <= TEMPLATE_IMAGE_MAX_BYTES) return jpeg;
  }
  throw new Error("IMAGE_TOO_LARGE");
}
