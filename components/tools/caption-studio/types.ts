export interface CaptionWord {
  word: string;
  start: number;
  end: number;
}

export interface CaptionSegment {
  id: number | string;
  start: number;
  end: number;
  text: string;
  words?: CaptionWord[];
}

export interface StylePreset {
  id: string;
  name: string;
  badge?: string;
  description?: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  bgColor: string;
  accentColor: string;
  uppercase: boolean;
  positionY: number;
  positionX: number;
  textAlign: "center" | "left" | "right";
  animation: string;
  preset?: string;
}

export interface VideoResolution {
  width: number;
  height: number;
  aspectRatio: string;
  label: string;
  category: string;
  quality: string;
}

export interface VideoFilters {
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  blur: number;
}
