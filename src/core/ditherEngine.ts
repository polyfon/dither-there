import type { DitherOptions, ImageProcessingResult } from '../types';
import { FloydSteinbergDithering } from './algorithms/floydSteinberg';
import { OrderedDithering } from './algorithms/orderedDithering';
import { AtkinsonDithering } from './algorithms/atkinson';
import { eventBus, Events } from '../lib/events/eventBus';

export type DitherAlgorithm = 'floyd-steinberg' | 'ordered' | 'atkinson' | 'sierra' | 'artistic';

export class DitherEngine {
  private canvas: OffscreenCanvas | HTMLCanvasElement;
  private ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  private currentImageData: ImageData | null = null;
  private originalImageData: ImageData | null = null;

  constructor() {
    // Try to use OffscreenCanvas if available
    if (typeof OffscreenCanvas !== 'undefined') {
      this.canvas = new OffscreenCanvas(1, 1);
      this.ctx = this.canvas.getContext('2d')!;
    } else {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d')!;
    }
  }

  async loadImage(source: File | string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        
        this.ctx.drawImage(img, 0, 0);
        const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
        
        this.originalImageData = new ImageData(
          new Uint8ClampedArray(imageData.data),
          imageData.width,
          imageData.height
        );
        
        this.currentImageData = imageData;
        eventBus.emit(Events.IMAGE_LOADED, { width: img.width, height: img.height });
        
        resolve(imageData);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      if (source instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(source);
      } else {
        img.src = source;
      }
    });
  }

  async process(options: DitherOptions): Promise<ImageProcessingResult> {
    if (!this.currentImageData) {
      throw new Error('No image loaded');
    }

    const startTime = performance.now();
    eventBus.emit(Events.IMAGE_PROCESSING, { algorithm: options.algorithm });

    // Create a copy of the original image data
    const imageData = new ImageData(
      new Uint8ClampedArray(this.originalImageData!.data),
      this.originalImageData!.width,
      this.originalImageData!.height
    );

    let processedData: Uint8ClampedArray;

    switch (options.algorithm) {
      case 'floyd-steinberg':
        processedData = FloydSteinbergDithering.process(
          imageData.data,
          imageData.width,
          imageData.height,
          options
        );
        break;
      
      case 'ordered':
        processedData = OrderedDithering.process(
          imageData.data,
          imageData.width,
          imageData.height,
          options
        );
        break;
      
      case 'atkinson':
        processedData = AtkinsonDithering.process(
          imageData.data,
          imageData.width,
          imageData.height,
          options
        );
        break;
      
      default:
        // Fallback to Floyd-Steinberg
        processedData = FloydSteinbergDithering.process(
          imageData.data,
          imageData.width,
          imageData.height,
          options
        );
    }

    const resultImageData = new ImageData(processedData, imageData.width, imageData.height);
    this.currentImageData = resultImageData;

    const processingTime = performance.now() - startTime;
    const result: ImageProcessingResult = {
      imageData: resultImageData,
      processingTime,
      algorithm: options.algorithm
    };

    eventBus.emit(Events.IMAGE_PROCESSED, result);
    return result;
  }

  async processChunked(options: DitherOptions, chunkSize: number = 100): Promise<ImageProcessingResult> {
    if (!this.currentImageData) {
      throw new Error('No image loaded');
    }

    const startTime = performance.now();
    const { width, height } = this.currentImageData;
    const totalRows = height;
    const chunks = Math.ceil(totalRows / chunkSize);

    // Create a copy for processing
    const imageData = new ImageData(
      new Uint8ClampedArray(this.originalImageData!.data),
      width,
      height
    );

    for (let i = 0; i < chunks; i++) {
      // const startRow = i * chunkSize;
      // const endRow = Math.min(startRow + chunkSize, height);
      
      // Process chunk
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          // Process partial image
          // This is a simplified version - in production, we'd process only the chunk
          resolve();
        }, 0);
      });
    }

    const processingTime = performance.now() - startTime;
    return {
      imageData,
      processingTime,
      algorithm: options.algorithm
    };
  }

  getOriginalImage(): ImageData | null {
    return this.originalImageData;
  }

  getCurrentImage(): ImageData | null {
    return this.currentImageData;
  }

  reset(): void {
    if (this.originalImageData) {
      this.currentImageData = new ImageData(
        new Uint8ClampedArray(this.originalImageData.data),
        this.originalImageData.width,
        this.originalImageData.height
      );
    }
  }

  async export(format: 'png' | 'jpeg' | 'webp' = 'png', quality: number = 0.95): Promise<Blob> {
    if (!this.currentImageData) {
      throw new Error('No image to export');
    }

    // Put current image data on canvas
    this.canvas.width = this.currentImageData.width;
    this.canvas.height = this.currentImageData.height;
    this.ctx.putImageData(this.currentImageData, 0, 0);

    // Convert to blob
    return new Promise((resolve, reject) => {
      if (this.canvas instanceof HTMLCanvasElement) {
        this.canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to export image'));
          },
          `image/${format}`,
          quality
        );
      } else {
        // For OffscreenCanvas
        (this.canvas as OffscreenCanvas).convertToBlob({
          type: `image/${format}`,
          quality
        }).then(resolve).catch(reject);
      }
    });
  }
}