/**
 * Gemini & AI Image Watermark Inpainting & Removal Engine
 *
 * Removes corner AI watermarks (Gemini 4-point sparkle, Imagen logos, DALL-E bars)
 * using content-aware boundary diffusion and gradient reconstruction.
 */

export interface WatermarkRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type WatermarkPresetCorner =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

/**
 * Calculates default preset watermark coordinates based on image resolution.
 * Google Gemini standard watermark is positioned at bottom-right with ~3% margin and ~6-8% size.
 */
export function getPresetWatermarkRegion(
  imageWidth: number,
  imageHeight: number,
  corner: WatermarkPresetCorner = "bottom-right",
  sizeRatio: number = 0.08
): WatermarkRegion {
  const minDim = Math.min(imageWidth, imageHeight);
  // Watermark box size typically between 48px and 120px
  const boxSize = Math.max(40, Math.min(140, Math.round(minDim * sizeRatio)));
  const margin = Math.max(16, Math.round(minDim * 0.025));

  switch (corner) {
    case "bottom-right":
      return {
        x: Math.max(0, imageWidth - boxSize - margin),
        y: Math.max(0, imageHeight - boxSize - margin),
        width: Math.min(imageWidth, boxSize + margin),
        height: Math.min(imageHeight, boxSize + margin),
      };
    case "bottom-left":
      return {
        x: 0,
        y: Math.max(0, imageHeight - boxSize - margin),
        width: Math.min(imageWidth, boxSize + margin),
        height: Math.min(imageHeight, boxSize + margin),
      };
    case "top-right":
      return {
        x: Math.max(0, imageWidth - boxSize - margin),
        y: 0,
        width: Math.min(imageWidth, boxSize + margin),
        height: Math.min(imageHeight, boxSize + margin),
      };
    case "top-left":
      return {
        x: 0,
        y: 0,
        width: Math.min(imageWidth, boxSize + margin),
        height: Math.min(imageHeight, boxSize + margin),
      };
  }
}

/**
 * Content-Aware Boundary-Weighted Diffusion Inpainting
 *
 * Reconstructs pixels inside the watermark mask by sampling perimeter pixels,
 * propagating color gradients inward, and blending subtle natural texture.
 */
export function inpaintRegion(
  ctx: CanvasRenderingContext2D,
  region: WatermarkRegion,
  options: { blendRadius?: number; noiseBlend?: boolean } = {}
): void {
  const { x: rx, y: ry, width: rw, height: rh } = region;
  const canvas = ctx.canvas;

  // Clamp to canvas bounds
  const x = Math.max(0, Math.min(canvas.width - 1, Math.round(rx)));
  const y = Math.max(0, Math.min(canvas.height - 1, Math.round(ry)));
  const w = Math.min(canvas.width - x, Math.round(rw));
  const h = Math.min(canvas.height - y, Math.round(rh));

  if (w <= 0 || h <= 0) return;

  const band = options.blendRadius || 12; // boundary sample thickness

  // Expand bounding box to read outer border context
  const bx = Math.max(0, x - band);
  const by = Math.max(0, y - band);
  const bw = Math.min(canvas.width - bx, w + band * 2);
  const bh = Math.min(canvas.height - by, h + band * 2);

  const imgData = ctx.getImageData(bx, by, bw, bh);
  const data = imgData.data;

  // Mask representation: true = inside watermark (needs fill), false = known boundary pixel
  const isMask = (px: number, py: number): boolean => {
    const gx = bx + px;
    const gy = by + py;
    return gx >= x && gx < x + w && gy >= y && gy < y + h;
  };

  const getPixel = (px: number, py: number) => {
    const idx = (py * bw + px) * 4;
    return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
  };

  // Pre-sample outer boundary color points
  interface BoundarySample {
    px: number;
    py: number;
    r: number;
    g: number;
    b: number;
  }
  const boundarySamples: BoundarySample[] = [];

  for (let py = 0; py < bh; py++) {
    for (let px = 0; px < bw; px++) {
      if (!isMask(px, py)) {
        // Check if adjacent to mask
        const nearMask =
          (px > 0 && isMask(px - 1, py)) ||
          (px < bw - 1 && isMask(px + 1, py)) ||
          (py > 0 && isMask(px, py - 1)) ||
          (py < bh - 1 && isMask(px, py + 1));

        if (nearMask || (px % 3 === 0 && py % 3 === 0)) {
          const [r, g, b] = getPixel(px, py);
          boundarySamples.push({ px, py, r, g, b });
        }
      }
    }
  }

  if (boundarySamples.length === 0) return;

  // Inverse distance weighted (IDW) interpolation with gradient smoothing
  for (let py = 0; py < bh; py++) {
    for (let px = 0; px < bw; px++) {
      if (!isMask(px, py)) continue;

      let totalWeight = 0;
      let accR = 0;
      let accG = 0;
      let accB = 0;

      // Sample closest boundary perimeter pixels
      for (let s = 0; s < boundarySamples.length; s++) {
        const sample = boundarySamples[s];
        const dx = px - sample.px;
        const dy = py - sample.py;
        const distSq = dx * dx + dy * dy;

        // Inverse squared distance weighting
        const weight = 1 / Math.max(1, distSq);
        totalWeight += weight;
        accR += sample.r * weight;
        accG += sample.g * weight;
        accB += sample.b * weight;
      }

      const idx = (py * bw + px) * 4;
      if (totalWeight > 0) {
        let finalR = Math.round(accR / totalWeight);
        let finalG = Math.round(accG / totalWeight);
        let finalB = Math.round(accB / totalWeight);

        // Optional natural film grain synthesis (±2 intensity) to prevent flat plastic look
        if (options.noiseBlend !== false) {
          const noise = (Math.random() - 0.5) * 4;
          finalR = Math.min(255, Math.max(0, finalR + noise));
          finalG = Math.min(255, Math.max(0, finalG + noise));
          finalB = Math.min(255, Math.max(0, finalB + noise));
        }

        data[idx] = finalR;
        data[idx + 1] = finalG;
        data[idx + 2] = finalB;
        data[idx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imgData, bx, by);
}
