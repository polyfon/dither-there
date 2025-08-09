import type { Color, DitherOptions } from '../../types';
import { ColorUtils } from '../color/colorUtils';

export class FloydSteinbergDithering {
  static process(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    options: DitherOptions
  ): Uint8ClampedArray {
    const output = new Uint8ClampedArray(pixels);
    const palette = options.palette || this.getDefaultPalette(options.colorDepth || 1);
    const strength = options.strength ?? 1.0;
    const serpentine = options.serpentine ?? false;

    for (let y = 0; y < height; y++) {
      const reverse = serpentine && y % 2 === 1;
      const xStart = reverse ? width - 1 : 0;
      const xEnd = reverse ? -1 : width;
      const xStep = reverse ? -1 : 1;

      for (let x = xStart; x !== xEnd; x += xStep) {
        const idx = (y * width + x) * 4;
        
        const oldColor: Color = {
          r: output[idx],
          g: output[idx + 1],
          b: output[idx + 2]
        };

        // Find closest color in palette
        const newColor = ColorUtils.findClosestColor(oldColor, palette);
        
        // Set new color
        output[idx] = newColor.r;
        output[idx + 1] = newColor.g;
        output[idx + 2] = newColor.b;

        // Calculate error
        const errorR = (oldColor.r - newColor.r) * strength;
        const errorG = (oldColor.g - newColor.g) * strength;
        const errorB = (oldColor.b - newColor.b) * strength;

        // Distribute error to neighboring pixels
        // Right: 7/16
        if (x + xStep >= 0 && x + xStep < width) {
          const rightIdx = (y * width + x + xStep) * 4;
          output[rightIdx] = this.clamp(output[rightIdx] + errorR * 7 / 16);
          output[rightIdx + 1] = this.clamp(output[rightIdx + 1] + errorG * 7 / 16);
          output[rightIdx + 2] = this.clamp(output[rightIdx + 2] + errorB * 7 / 16);
        }

        // Bottom-left: 3/16
        if (y + 1 < height && x - xStep >= 0 && x - xStep < width) {
          const blIdx = ((y + 1) * width + x - xStep) * 4;
          output[blIdx] = this.clamp(output[blIdx] + errorR * 3 / 16);
          output[blIdx + 1] = this.clamp(output[blIdx + 1] + errorG * 3 / 16);
          output[blIdx + 2] = this.clamp(output[blIdx + 2] + errorB * 3 / 16);
        }

        // Bottom: 5/16
        if (y + 1 < height) {
          const bIdx = ((y + 1) * width + x) * 4;
          output[bIdx] = this.clamp(output[bIdx] + errorR * 5 / 16);
          output[bIdx + 1] = this.clamp(output[bIdx + 1] + errorG * 5 / 16);
          output[bIdx + 2] = this.clamp(output[bIdx + 2] + errorB * 5 / 16);
        }

        // Bottom-right: 1/16
        if (y + 1 < height && x + xStep >= 0 && x + xStep < width) {
          const brIdx = ((y + 1) * width + x + xStep) * 4;
          output[brIdx] = this.clamp(output[brIdx] + errorR * 1 / 16);
          output[brIdx + 1] = this.clamp(output[brIdx + 1] + errorG * 1 / 16);
          output[brIdx + 2] = this.clamp(output[brIdx + 2] + errorB * 1 / 16);
        }
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
      // Black and white
      palette.push({ r: 0, g: 0, b: 0 });
      palette.push({ r: 255, g: 255, b: 255 });
    } else {
      // Generate grayscale palette
      for (let i = 0; i < levels; i++) {
        const value = Math.round((i / (levels - 1)) * 255);
        palette.push({ r: value, g: value, b: value });
      }
    }
    
    return palette;
  }
}