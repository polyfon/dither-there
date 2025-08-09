import './style.css';
import { DitherEngine } from './core/ditherEngine';
import { eventBus, Events } from './lib/events/eventBus';
import './ui/canvas/pixelCanvas';
import './ui/controls/algorithmGrid';
import './ui/controls/parameterControls';
import './ui/controls/paletteSelector';
import type { DitherOptions, Palette } from './types';

class DithApp {
  private ditherEngine: DitherEngine;
  private canvas: HTMLElement | null = null;
  private algorithmGrid: HTMLElement | null = null;
  private parameterControls: HTMLElement | null = null;
  private paletteSelector: HTMLElement | null = null;
  private currentOptions: DitherOptions = {
    algorithm: 'floyd-steinberg',
    colorDepth: 1,
    strength: 1.0
  };

  constructor() {
    this.ditherEngine = new DitherEngine();
    this.init();
  }

  private async init() {
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupUI());
    } else {
      this.setupUI();
    }
  }

  private setupUI() {
    const app = document.querySelector<HTMLDivElement>('#app');
    if (!app) return;

    app.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <div class="logo">
            <span class="logo-text">DITH</span>
          </div>
          <div class="header-actions">
            <button class="export-btn" id="exportBtn">Export</button>
          </div>
        </header>
        
        <div class="main-layout">
          <aside class="control-panel">
            <algorithm-grid id="algorithmGrid"></algorithm-grid>
            <parameter-controls id="parameterControls"></parameter-controls>
          </aside>
          
          <main class="canvas-area">
            <pixel-canvas id="pixelCanvas"></pixel-canvas>
          </main>
        </div>
        
        <div class="palette-bar">
          <palette-selector id="paletteSelector"></palette-selector>
        </div>
      </div>
    `;

    this.canvas = document.getElementById('pixelCanvas');
    this.algorithmGrid = document.getElementById('algorithmGrid');
    this.parameterControls = document.getElementById('parameterControls');
    this.paletteSelector = document.getElementById('paletteSelector');

    this.setupEventListeners();
    this.loadDemoImage();
  }

  private setupEventListeners() {
    // File selection
    this.canvas?.addEventListener('fileselected', async (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.file) {
        await this.loadImage(detail.file);
      }
    });

    // Canvas export request
    this.canvas?.addEventListener('exportrequested', () => {
      this.exportImage();
    });

    // Algorithm change
    this.algorithmGrid?.addEventListener('algorithmchange', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      this.currentOptions.algorithm = detail.algorithm;
      this.processImage();
    });

    // Palette change
    this.paletteSelector?.addEventListener('palettechange', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const palette = detail.palette as Palette;
      this.currentOptions.palette = palette.colors;
      this.processImage();
    });

    // Parameter change
    this.parameterControls?.addEventListener('parameterchange', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      this.currentOptions.strength = detail.strength;
      // Note: contrast and brightness would need to be added to DitherOptions
      this.processImage();
    });

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    exportBtn?.addEventListener('click', () => this.exportImage());

    // Listen to processing events
    eventBus.on(Events.IMAGE_PROCESSED, (result) => {
      console.log(`Processed in ${result.processingTime.toFixed(2)}ms`);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Prevent shortcuts when typing in inputs
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
      
      switch (e.key.toLowerCase()) {
        case ' ': // Space - toggle original/processed (TODO: implement)
          e.preventDefault();
          console.log('Toggle view (not implemented)');
          break;
        case 'e': // Export
          e.preventDefault();
          this.exportImage();
          break;
        case 'c': // Copy to clipboard
          e.preventDefault();
          const canvas = this.canvas as any;
          if (canvas && canvas.triggerCopy) {
            canvas.triggerCopy();
          }
          break;
        case 'r': // Reset parameters (TODO: implement)
          e.preventDefault();
          console.log('Reset parameters (not implemented)');
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          e.preventDefault();
          const algorithms = ['floyd-steinberg', 'ordered', 'atkinson', 'sierra', 'artistic'];
          const algorithmIndex = parseInt(e.key) - 1;
          if (algorithms[algorithmIndex]) {
            this.currentOptions.algorithm = algorithms[algorithmIndex] as any;
            // TODO: Update algorithm grid UI to reflect selection
            this.processImage();
          }
          break;
      }
    });
  }

  private async loadImage(file: File) {
    try {
      await this.ditherEngine.loadImage(file);
      this.processImage();
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  }

  private async loadDemoImage() {
    // Create a gradient demo image
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Create radial gradient
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, '#00ff88');
    gradient.addColorStop(0.6, '#ff00aa');
    gradient.addColorStop(1, '#000000');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Add some geometric shapes
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(256, 256, 30 + i * 30, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Convert to data URL and load
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'demo.png', { type: 'image/png' });
        await this.loadImage(file);
      }
    });
  }

  private async processImage() {
    const currentImage = this.ditherEngine.getCurrentImage();
    if (!currentImage) return;

    try {
      await this.ditherEngine.process(this.currentOptions);
      // The canvas will update automatically via event bus
    } catch (error) {
      console.error('Failed to process image:', error);
    }
  }

  private async exportImage() {
    try {
      const blob = await this.ditherEngine.export('png');
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `pixelweave-${Date.now()}.png`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export image:', error);
    }
  }
}

// Initialize app
new DithApp();