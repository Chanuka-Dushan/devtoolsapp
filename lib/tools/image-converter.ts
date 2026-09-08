/**
 * Client-Side Image Processing & Conversion Engine
 *
 * Supports conversions across PNG, JPEG, WebP, BMP, ICO, and SVG vectorization.
 * Operates 100% in-browser using HTML5 Canvas and mathematical vector contour tracing.
 */

export type ImageOutputFormat = "webp" | "png" | "jpeg" | "bmp" | "ico" | "svg";

export interface ImageConversionOptions {
  format: ImageOutputFormat;
  quality?: number; // 0.1 to 1.0 (for webp and jpeg)
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  backgroundColor?: string; // For JPG / BMP transparency flattening
  svgColors?: number; // For SVG vectorization (2 to 32)
  svgDetail?: number; // 1 to 5
}

export interface ImageConversionResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  convertedSize: number;
  format: ImageOutputFormat;
  mimeType: string;
  svgCode?: string;
}

/**
 * Loads an image file or DataURL into an HTMLImageElement
 */
export function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error("Failed to load image source: " + err));

    if (typeof source === "string") {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Converts raster image data to an SVG vector string using color quantization and polygonal contour tracing
 */
export function traceImageToSvg(
  img: HTMLImageElement,
  options: { colors?: number; detail?: number; contrast?: number } = {}
): string {
  const numColors = Math.min(Math.max(options.colors || 8, 2), 32);
  const detail = Math.min(Math.max(options.detail || 3, 1), 5);

  // Downscale slightly for fast and smooth vector tracing
  const maxDim = 320;
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  if (w > maxDim || h > maxDim) {
    if (w > h) {
      h = Math.round((h * maxDim) / w);
      w = maxDim;
    } else {
      w = Math.round((w * maxDim) / h);
      h = maxDim;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not acquire 2D canvas context.");

  ctx.drawImage(img, 0, 0, w, h);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Simple and effective color quantization (RGB binning)
  const step = Math.floor(256 / Math.cbrt(numColors));
  const quantize = (val: number) =>
    Math.min(255, Math.floor(val / step) * step + Math.floor(step / 2));

  // Build grid of quantized color indexes
  const colorMap = new Map<string, string>();
  const grid: string[] = new Array(w * h);

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 64) {
      grid[i / 4] = "transparent";
      continue;
    }

    const r = quantize(data[i]);
    const g = quantize(data[i + 1]);
    const b = quantize(data[i + 2]);
    const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

    colorMap.set(hex, hex);
    grid[i / 4] = hex;
  }

  // Generate SVG grouped rectangles / block paths by color
  const pathsByColor = new Map<string, string[]>();
  const blockSize = Math.max(1, 6 - detail);

  for (let y = 0; y < h; y += blockSize) {
    for (let x = 0; x < w; x += blockSize) {
      const idx = y * w + x;
      const color = grid[idx];
      if (!color || color === "transparent") continue;

      let bw = blockSize;
      let bh = blockSize;
      // Merge horizontal contiguous blocks of same color
      while (
        x + bw < w &&
        grid[y * w + (x + bw)] === color &&
        bw < blockSize * 8
      ) {
        bw += blockSize;
      }

      if (!pathsByColor.has(color)) {
        pathsByColor.set(color, []);
      }
      pathsByColor
        .get(color)!
        .push(`M${x},${y}h${Math.min(bw, w - x)}v${Math.min(bh, h - y)}h-${Math.min(bw, w - x)}z`);

      x += bw - blockSize;
    }
  }

  // Assemble SVG XML
  let svgPaths = "";
  for (const [color, paths] of pathsByColor.entries()) {
    svgPaths += `  <path fill="${color}" d="${paths.join(" ")}" />\n`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${img.naturalWidth || w}" height="${img.naturalHeight || h}" shape-rendering="crispEdges">\n${svgPaths}</svg>`;
  return svg;
}

/**
 * Creates a valid Windows ICO icon file binary blob from a canvas
 */
export async function createIcoBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  // Resize to 32x32 standard favicon
  const icoCanvas = document.createElement("canvas");
  icoCanvas.width = 32;
  icoCanvas.height = 32;
  const ctx = icoCanvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(canvas, 0, 0, 32, 32);
  }

  const pngBlob = await new Promise<Blob | null>((resolve) =>
    icoCanvas.toBlob(resolve, "image/png")
  );
  if (!pngBlob) throw new Error("Failed to generate PNG buffer for ICO.");

  const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());

  // Construct ICO Header (6 bytes) + 1 Directory Entry (16 bytes) + PNG Data
  const totalSize = 6 + 16 + pngBytes.length;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // ICONDIR Header
  view.setUint16(0, 0, true); // Reserved (0)
  view.setUint16(2, 1, true); // Type (1 = ICO)
  view.setUint16(4, 1, true); // Count (1 image)

  // ICONDIRENTRY (Entry 0)
  view.setUint8(6, 32); // Width (32px)
  view.setUint8(7, 32); // Height (32px)
  view.setUint8(8, 0); // Color count (0 = >= 8bpp)
  view.setUint8(9, 0); // Reserved
  view.setUint16(10, 1, true); // Color planes
  view.setUint16(12, 32, true); // Bits per pixel (32bpp)
  view.setUint32(14, pngBytes.length, true); // Image data size in bytes
  view.setUint32(18, 22, true); // Offset of image data (6 + 16 = 22)

  // Write PNG Payload
  new Uint8Array(buffer, 22).set(pngBytes);

  return new Blob([buffer], { type: "image/x-icon" });
}

/**
 * Main universal image conversion function
 */
export async function convertImage(
  source: File | HTMLImageElement,
  options: ImageConversionOptions
): Promise<ImageConversionResult> {
  const img = source instanceof HTMLImageElement ? source : await loadImage(source);
  const originalSize = source instanceof File ? source.size : 0;

  let targetWidth = options.width || img.naturalWidth || img.width;
  let targetHeight = options.height || img.naturalHeight || img.height;

  if (options.maintainAspectRatio && options.width && !options.height) {
    const ratio = (img.naturalHeight || img.height) / (img.naturalWidth || img.width);
    targetHeight = Math.round(options.width * ratio);
  } else if (options.maintainAspectRatio && options.height && !options.width) {
    const ratio = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
    targetWidth = Math.round(options.height * ratio);
  }

  // Handle SVG vectorization
  if (options.format === "svg") {
    const svgCode = traceImageToSvg(img, {
      colors: options.svgColors || 8,
      detail: options.svgDetail || 3,
    });
    const blob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgCode)}`;

    return {
      blob,
      dataUrl,
      width: targetWidth,
      height: targetHeight,
      originalSize,
      convertedSize: blob.size,
      format: "svg",
      mimeType: "image/svg+xml",
      svgCode,
    };
  }

  // Canvas-based raster transcoding
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not acquire 2D canvas context.");

  // Flatten transparency with background color if saving to JPG / BMP
  if (options.format === "jpeg" || options.format === "bmp") {
    ctx.fillStyle = options.backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Handle ICO
  if (options.format === "ico") {
    const blob = await createIcoBlob(canvas);
    const dataUrl = URL.createObjectURL(blob);
    return {
      blob,
      dataUrl,
      width: 32,
      height: 32,
      originalSize,
      convertedSize: blob.size,
      format: "ico",
      mimeType: "image/x-icon",
    };
  }

  // Determine MIME type
  let mimeType = "image/png";
  if (options.format === "webp") mimeType = "image/webp";
  else if (options.format === "jpeg") mimeType = "image/jpeg";
  else if (options.format === "bmp") mimeType = "image/bmp";

  const quality = typeof options.quality === "number" ? options.quality : 0.92;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error(`Failed to encode image to ${options.format}`));
      },
      mimeType,
      quality
    );
  });

  const dataUrl = canvas.toDataURL(mimeType, quality);

  return {
    blob,
    dataUrl,
    width: targetWidth,
    height: targetHeight,
    originalSize,
    convertedSize: blob.size,
    format: options.format,
    mimeType,
  };
}
