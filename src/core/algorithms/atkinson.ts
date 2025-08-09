import type { Color, DitherOptions } from '../../types';
import { ColorUtils } from '../color/colorUtils';

export class AtkinsonDithering {
  static process(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    options: DitherOptions
  ): Uint8ClampedArray {
    const output = new Uint8ClampedArray(pixels);
    const palette = options.palette || this.getDefaultPalette(options.colorDepth || 1);
    const preserveHighlights = options.preserveHighlights ?? true;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
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

        // Calculate error (Atkinson distributes only 6/8 of the error)
        let errorR = (oldColor.r - newColor.r) * 6 / 8;
        let errorG = (oldColor.g - newColor.g) * 6 / 8;
        let errorB = (oldColor.b - newColor.b) * 6 / 8;

        // Preserve highlights by reducing error distribution in bright areas
        if (preserveHighlights) {
          const luminance = ColorUtils.getLuminance(oldColor);
          if (luminance > 0.8) {
            const factor = 1 - ((luminance - 0.8) * 2.5); // Reduce error in highlights
            errorR *= factor;
            errorG *= factor;
            errorB *= factor;
          }
        }

        // Distribute error to neighboring pixels
        // Pattern:
        //     X   1/8 1/8
        // 1/8 1/8 1/8
        //     1/8

        // Right (x+1, y): 1/8
        if (x + 1 < width) {
          const rightIdx = (y * width + x + 1) * 4;
          output[rightIdx] = this.clamp(output[rightIdx] + errorR / 8);
          output[rightIdx + 1] = this.clamp(output[rightIdx + 1] + errorG / 8);
          output[rightIdx + 2] = this.clamp(output[rightIdx + 2] + errorB / 8);
        }

        // Right-right (x+2, y): 1/8
        if (x + 2 < width) {
          const rrIdx = (y * width + x + 2) * 4;
          output[rrIdx] = this.clamp(output[rrIdx] + errorR / 8);
          output[rrIdx + 1] = this.clamp(output[rrIdx + 1] + errorG / 8);
          output[rrIdx + 2] = this.clamp(output[rrIdx + 2] + errorB / 8);
        }

        // Bottom-left (x-1, y+1): 1/8
        if (y + 1 < height && x > 0) {
          const blIdx = ((y + 1) * width + x - 1) * 4;
          output[blIdx] = this.clamp(output[blIdx] + errorR / 8);
          output[blIdx + 1] = this.clamp(output[blIdx + 1] + errorG / 8);
          output[blIdx + 2] = this.clamp(output[blIdx + 2] + errorB / 8);
        }

        // Bottom (x, y+1): 1/8
        if (y + 1 < height) {
          const bIdx = ((y + 1) * width + x) * 4;
          output[bIdx] = this.clamp(output[bIdx] + errorR / 8);
          output[bIdx + 1] = this.clamp(output[bIdx + 1] + errorG / 8);
          output[bIdx + 2] = this.clamp(output[bIdx + 2] + errorB / 8);
        }

        // Bottom-right (x+1, y+1): 1/8
        if (y + 1 < height && x + 1 < width) {
          const brIdx = ((y + 1) * width + x + 1) * 4;
          output[brIdx] = this.clamp(output[brIdx] + errorR / 8);
          output[brIdx + 1] = this.clamp(output[brIdx + 1] + errorG / 8);
          output[brIdx + 2] = this.clamp(output[brIdx + 2] + errorB / 8);
        }

        // Bottom-bottom (x, y+2): 1/8
        if (y + 2 < height) {
          const bbIdx = ((y + 2) * width + x) * 4;
          output[bbIdx] = this.clamp(output[bbIdx] + errorR / 8);
          output[bbIdx + 1] = this.clamp(output[bbIdx + 1] + errorG / 8);
          output[bbIdx + 2] = this.clamp(output[bbIdx + 2] + errorB / 8);
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
}