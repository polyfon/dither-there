import type { Color } from '../../types';

export class ColorUtils {
  static rgbToHex(color: Color): string {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16).padStart(2, '0');
      return hex;
    };
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  }

  static hexToRgb(hex: string): Color {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) throw new Error('Invalid hex color');
    
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }

  static getLuminance(color: Color): number {
    // Using relative luminance formula
    const normalize = (val: number) => {
      const v = val / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    
    const r = normalize(color.r);
    const g = normalize(color.g);
    const b = normalize(color.b);
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  static distance(c1: Color, c2: Color): number {
    // Euclidean distance in RGB space
    const dr = c1.r - c2.r;
    const dg = c1.g - c2.g;
    const db = c1.b - c2.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  static findClosestColor(color: Color, palette: Color[]): Color {
    let minDistance = Infinity;
    let closestColor = palette[0];
    
    for (const paletteColor of palette) {
      const distance = this.distance(color, paletteColor);
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = paletteColor;
      }
    }
    
    return closestColor;
  }

  static quantizeToDepth(color: Color, bitDepth: number): Color {
    const levels = Math.pow(2, bitDepth);
    const factor = 255 / (levels - 1);
    
    return {
      r: Math.round(Math.round(color.r / factor) * factor),
      g: Math.round(Math.round(color.g / factor) * factor),
      b: Math.round(Math.round(color.b / factor) * factor)
    };
  }

  static mix(c1: Color, c2: Color, ratio: number): Color {
    return {
      r: Math.round(c1.r * (1 - ratio) + c2.r * ratio),
      g: Math.round(c1.g * (1 - ratio) + c2.g * ratio),
      b: Math.round(c1.b * (1 - ratio) + c2.b * ratio)
    };
  }

  static adjustBrightness(color: Color, amount: number): Color {
    return {
      r: Math.max(0, Math.min(255, color.r + amount)),
      g: Math.max(0, Math.min(255, color.g + amount)),
      b: Math.max(0, Math.min(255, color.b + amount))
    };
  }

  static adjustContrast(color: Color, amount: number): Color {
    const factor = (259 * (amount + 255)) / (255 * (259 - amount));
    
    return {
      r: Math.max(0, Math.min(255, factor * (color.r - 128) + 128)),
      g: Math.max(0, Math.min(255, factor * (color.g - 128) + 128)),
      b: Math.max(0, Math.min(255, factor * (color.b - 128) + 128))
    };
  }
}