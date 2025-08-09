import type { Color, DitherOptions } from '../../types';
import { ColorUtils } from '../color/colorUtils';

export class OrderedDithering {
  private static readonly BAYER_MATRICES = {
    2: [
      [0, 2],
      [3, 1]
    ],
    4: [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5]
    ],
    8: [
      [0, 32, 8, 40, 2, 34, 10, 42],
      [48, 16, 56, 24, 50, 18, 58, 26],
      [12, 44, 4, 36, 14, 46, 6, 38],
      [60, 28, 52, 20, 62, 30, 54, 22],
      [3, 35, 11, 43, 1, 33, 9, 41],
      [51, 19, 59, 27, 49, 17, 57, 25],
      [15, 47, 7, 39, 13, 45, 5, 37],
      [63, 31, 55, 23, 61, 29, 53, 21]
    ]
  };

  static process(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    options: DitherOptions
  ): Uint8ClampedArray {
    const output = new Uint8ClampedArray(pixels);
    const matrixSize = options.matrixSize || 4;
    const matrix = this.BAYER_MATRICES[matrixSize as keyof typeof this.BAYER_MATRICES] || this.BAYER_MATRICES[4];
    const matrixDimension = matrix.length;
    const maxValue = matrixDimension * matrixDimension;
    const palette = options.palette || this.getDefaultPalette(options.colorDepth || 1);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        
        const matrixX = x % matrixDimension;
        const matrixY = y % matrixDimension;
        const threshold = (matrix[matrixY][matrixX] / maxValue - 0.5) * 255;

        const color: Color = {
          r: output[idx],
          g: output[idx + 1],
          b: output[idx + 2]
        };

        // Apply threshold
        const adjustedColor: Color = {
          r: this.clamp(color.r + threshold),
          g: this.clamp(color.g + threshold),
          b: this.clamp(color.b + threshold)
        };

        // Find closest color in palette
        const newColor = ColorUtils.findClosestColor(adjustedColor, palette);
        
        output[idx] = newColor.r;
        output[idx + 1] = newColor.g;
        output[idx + 2] = newColor.b;
      }
    }

    return output;
  }

  private static clamp(value: number): number {
    return Math.max(0, Math.min(255, Math.round(value)));
  }

  private static getDefaultPalette(bitDepth: number): Color[] {
    const levels = Math.pow(2, bitDepth);
    const palette: Color[] = [];
    
    if (bitDepth === 1) {
      palette.push({ r: 0, g: 0, b: 0 });
      palette.push({ r: 255, g: 255, b: 255 });
    } else {
      for (let i = 0; i < levels; i++) {
        const value = Math.round((i / (levels - 1)) * 255);
        palette.push({ r: value, g: value, b: value });
      }
    }
    
    return palette;
  }

  static generateBayerMatrix(size: number): number[][] {
    if (size === 2) return this.BAYER_MATRICES[2];
    if (size === 4) return this.BAYER_MATRICES[4];
    if (size === 8) return this.BAYER_MATRICES[8];
    
    // Generate larger matrices recursively
    const smallerMatrix = this.generateBayerMatrix(size / 2);
    const n = smallerMatrix.length;
    const matrix: number[][] = Array(size).fill(null).map(() => Array(size).fill(0));
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const quadrant = (Math.floor(y / n) * 2) + Math.floor(x / n);
        const smallY = y % n;
        const smallX = x % n;
        matrix[y][x] = 4 * smallerMatrix[smallY][smallX] + quadrant;
      }
    }
    
    return matrix;
  }
}