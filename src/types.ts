export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface DitherOptions {
  algorithm: string;
  palette?: Color[];
  strength?: number;
  colorDepth?: number;
  pattern?: string;
  matrixSize?: number;
  serpentine?: boolean;
  preserveHighlights?: boolean;
}

export interface ImageProcessingResult {
  imageData: ImageData;
  processingTime: number;
  algorithm: string;
}

export interface Palette {
  id: string;
  name: string;
  artist?: string;
  colors: Color[];
  description?: string;
}