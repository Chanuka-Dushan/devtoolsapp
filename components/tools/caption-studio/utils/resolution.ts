import { VideoResolution } from "../types";

export function detectAspectRatio(width: number, height: number): VideoResolution {
  if (!width || !height || width <= 0 || height <= 0) {
    return {
      width: 1920,
      height: 1080,
      aspectRatio: "16:9",
      label: "1920 × 1080 (16:9)",
      category: "16:9 (Landscape)",
      quality: "1080p FHD",
    };
  }

  const ratio = width / height;
  let ar = "16:9";
  let cat = "16:9 (Widescreen HD)";

  if (Math.abs(ratio - 9 / 16) < 0.08) {
    ar = "9:16";
    cat = "9:16 (Vertical Reel/TikTok)";
  } else if (Math.abs(ratio - 16 / 9) < 0.12) {
    ar = "16:9";
    cat = "16:9 (Widescreen HD)";
  } else if (Math.abs(ratio - 1.0) < 0.08) {
    ar = "1:1";
    cat = "1:1 (Square)";
  } else if (Math.abs(ratio - 4 / 5) < 0.08) {
    ar = "4:5";
    cat = "4:5 (Portrait Feed)";
  } else if (ratio > 2.0) {
    ar = "21:9";
    cat = "21:9 (Ultrawide)";
  } else if (ratio < 1.0) {
    ar = "9:16";
    cat = `${width}:${height} (Vertical)`;
  } else {
    ar = "16:9";
    cat = `${width}:${height} (Horizontal)`;
  }

  let quality = "";
  const minDim = Math.min(width, height);
  const maxDim = Math.max(width, height);

  if (maxDim >= 3840 || minDim >= 2160) {
    quality = "4K UHD";
  } else if (maxDim >= 2560 || minDim >= 1440) {
    quality = "2K QHD";
  } else if (maxDim >= 1920 || minDim >= 1080) {
    quality = "1080p FHD";
  } else if (maxDim >= 1280 || minDim >= 720) {
    quality = "720p HD";
  } else if (maxDim >= 854 || minDim >= 480) {
    quality = "480p SD";
  } else {
    quality = `${minDim}p`;
  }

  return {
    width,
    height,
    aspectRatio: ar,
    label: `${width} × ${height} (${ar})`,
    category: cat,
    quality,
  };
}
