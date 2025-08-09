import { eventBus, Events } from '../../lib/events/eventBus';

export class PixelCanvas extends HTMLElement {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private imageData: ImageData | null = null;
  private scale: number = 1;
  private offsetX: number = 0;
  private offsetY: number = 0;
  private isDragging: boolean = false;
  private lastX: number = 0;
  private lastY: number = 0;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { 
      imageSmoothingEnabled: false 
    }) as CanvasRenderingContext2D;
    
    this.setupStyles();
    this.setupEventListeners();
    this.render();
  }

  connectedCallback() {
    // Use ResizeObserver for better responsiveness
    const resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });
    resizeObserver.observe(this);
    
    // Subscribe to image events
    eventBus.on(Events.IMAGE_PROCESSING, () => {
      this.showProcessing();
    });

    eventBus.on(Events.IMAGE_PROCESSED, (result) => {
      this.setImageData(result.imageData);
    });
  }

  disconnectedCallback() {
    window.removeEventListener('resize', () => this.resizeCanvas());
  }

  private setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
        background: #FFFFFF;
        border: 2px solid #CCCCCC;
        overflow: hidden;
        cursor: grab;
        box-shadow: inset 1px 1px 0 rgba(255,255,255,0.8), inset -1px -1px 0 rgba(0,0,0,0.2);
      }

      :host(.dragging) {
        cursor: grabbing;
      }

      canvas {
        position: absolute;
        image-rendering: pixelated;
        image-rendering: -moz-crisp-edges;
        image-rendering: crisp-edges;
        transition: none;
      }

      .controls {
        position: absolute;
        bottom: 16px;
        right: 16px;
        display: flex;
        gap: 8px;
        background: rgba(246, 246, 246, 0.95);
        backdrop-filter: blur(8px);
        border: 2px solid #CCCCCC;
        border-radius: 8px;
        padding: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), inset 1px 1px 0 rgba(255,255,255,0.8);
      }

      .control-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border: none;
        background: rgba(255, 255, 255, 0.9);
        color: #000000;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        font-family: inherit;
        transition: all 0.15s ease;
        border-radius: 4px;
        box-shadow: inset 1px 1px 0 rgba(255,255,255,0.8), inset -1px -1px 0 rgba(0,0,0,0.1);
      }

      .control-btn:hover {
        background: #0066CC;
        color: #FFFFFF;
        box-shadow: inset -1px -1px 0 rgba(255,255,255,0.3), inset 1px 1px 0 rgba(0,0,0,0.3);
        transform: translateY(-1px);
      }

      .control-btn:active {
        box-shadow: inset 1px 1px 2px rgba(0,0,0,0.3);
        transform: translateY(0);
      }

      .zoom-controls {
        position: absolute;
        bottom: 16px;
        left: 16px;
        display: flex;
        gap: 4px;
        background: rgba(246, 246, 246, 0.95);
        backdrop-filter: blur(8px);
        border: 2px solid #CCCCCC;
        border-radius: 8px;
        padding: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .zoom-btn {
        width: 32px;
        height: 32px;
        border: none;
        background: rgba(255, 255, 255, 0.9);
        color: #000000;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        font-family: inherit;
        border-radius: 4px;
        transition: all 0.1s ease;
      }

      .zoom-btn:hover {
        background: #0066CC;
        color: #FFFFFF;
      }

      .image-info {
        position: absolute;
        top: 16px;
        left: 16px;
        background: rgba(246, 246, 246, 0.95);
        backdrop-filter: blur(8px);
        border: 2px solid #CCCCCC;
        border-radius: 8px;
        padding: 12px;
        font-size: 12px;
        font-weight: 500;
        color: #666666;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }

      .image-info.visible {
        opacity: 1;
      }

      .processing-indicator {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 102, 204, 0.95);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-weight: 500;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }

      .processing-indicator.visible {
        opacity: 1;
      }

      .drop-zone {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(246, 246, 246, 0.95);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        font-family: 'Chicago', 'JetBrains Mono', monospace;
      }

      .drop-zone.active {
        opacity: 1;
        pointer-events: all;
      }

      .drop-zone.dragging {
        background: rgba(230, 230, 230, 0.98);
      }

      .drop-message {
        color: #0066CC;
        font-size: 16px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 8px;
      }

      .drop-hint {
        color: #666666;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .drop-border {
        position: absolute;
        inset: 16px;
        border: 2px dashed #CCCCCC;
        pointer-events: none;
      }
    `;
    
    this.shadowRoot!.appendChild(style);
  }

  private setupEventListeners() {
    // Mouse events for panning
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));
    
    // Wheel event for zooming
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    
    // Touch events for mobile
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  private handleMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.classList.add('dragging');
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    
    this.offsetX += dx;
    this.offsetY += dy;
    
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    
    this.drawImage();
  }

  private handleMouseUp() {
    this.isDragging = false;
    this.classList.remove('dragging');
  }

  private handleWheel(e: WheelEvent) {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(10, this.scale * delta));
    
    // Zoom towards mouse position
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const scaleChange = newScale - this.scale;
    this.offsetX -= x * scaleChange;
    this.offsetY -= y * scaleChange;
    
    this.scale = newScale;
    this.drawImage();
  }

  private handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      this.isDragging = true;
      this.lastX = e.touches[0].clientX;
      this.lastY = e.touches[0].clientY;
    }
  }

  private handleTouchMove(e: TouchEvent) {
    if (!this.isDragging || e.touches.length !== 1) return;
    
    const dx = e.touches[0].clientX - this.lastX;
    const dy = e.touches[0].clientY - this.lastY;
    
    this.offsetX += dx;
    this.offsetY += dy;
    
    this.lastX = e.touches[0].clientX;
    this.lastY = e.touches[0].clientY;
    
    this.drawImage();
  }

  private handleTouchEnd() {
    this.isDragging = false;
  }

  private resizeCanvas() {
    const rect = this.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.drawImage();
  }

  setImageData(imageData: ImageData) {
    this.imageData = imageData;
    this.fitToView();
    this.drawImage();
    this.updateImageInfo();
    this.hideProcessing();
  }

  private fitToView() {
    if (!this.imageData) return;
    
    const rect = this.getBoundingClientRect();
    const scaleX = rect.width / this.imageData.width;
    const scaleY = rect.height / this.imageData.height;
    
    this.scale = Math.min(scaleX, scaleY) * 0.9; // 90% to leave some padding
    this.offsetX = (rect.width - this.imageData.width * this.scale) / 2;
    this.offsetY = (rect.height - this.imageData.height * this.scale) / 2;
  }

  private drawImage() {
    if (!this.imageData) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Create temporary canvas for the image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.imageData.width;
    tempCanvas.height = this.imageData.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(this.imageData, 0, 0);
    
    // Draw scaled image
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(
      tempCanvas,
      this.offsetX,
      this.offsetY,
      this.imageData.width * this.scale,
      this.imageData.height * this.scale
    );
  }

  private render() {
    // Add canvas to shadow DOM
    this.shadowRoot!.appendChild(this.canvas);
    
    // Add zoom controls
    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';
    
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.className = 'zoom-btn';
    zoomOutBtn.textContent = '−';
    zoomOutBtn.title = 'Zoom Out';
    zoomOutBtn.onclick = () => {
      this.scale = Math.max(0.1, this.scale * 0.8);
      this.drawImage();
      this.updateImageInfo();
    };
    
    const fitBtn = document.createElement('button');
    fitBtn.className = 'zoom-btn';
    fitBtn.textContent = '⌧';
    fitBtn.title = 'Fit to View';
    fitBtn.onclick = () => {
      this.fitToView();
      this.drawImage();
      this.updateImageInfo();
    };
    
    const zoomInBtn = document.createElement('button');
    zoomInBtn.className = 'zoom-btn';
    zoomInBtn.textContent = '+';
    zoomInBtn.title = 'Zoom In';
    zoomInBtn.onclick = () => {
      this.scale = Math.min(10, this.scale * 1.2);
      this.drawImage();
      this.updateImageInfo();
    };
    
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(fitBtn);
    zoomControls.appendChild(zoomInBtn);
    
    // Add main controls
    const controls = document.createElement('div');
    controls.className = 'controls';
    
    const loadBtn = document.createElement('button');
    loadBtn.className = 'control-btn';
    loadBtn.innerHTML = '📁 Load Image';
    loadBtn.onclick = () => this.handleLoadClick();
    
    const exportBtn = document.createElement('button');
    exportBtn.className = 'control-btn';
    exportBtn.innerHTML = '💾 Export';
    exportBtn.onclick = () => this.handleExportClick();
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'control-btn';
    copyBtn.innerHTML = '📋 Copy';
    copyBtn.onclick = () => this.handleCopyClick();
    
    controls.appendChild(loadBtn);
    controls.appendChild(copyBtn);
    controls.appendChild(exportBtn);
    
    // Add image info panel
    const imageInfo = document.createElement('div');
    imageInfo.className = 'image-info';
    imageInfo.id = 'imageInfo';
    
    // Add processing indicator
    const processingIndicator = document.createElement('div');
    processingIndicator.className = 'processing-indicator';
    processingIndicator.id = 'processingIndicator';
    processingIndicator.textContent = 'Processing...';
    
    this.shadowRoot!.appendChild(zoomControls);
    this.shadowRoot!.appendChild(controls);
    this.shadowRoot!.appendChild(imageInfo);
    this.shadowRoot!.appendChild(processingIndicator);
    
    // Add drop zone
    const dropZone = document.createElement('div');
    dropZone.className = 'drop-zone';
    if (!this.imageData) {
      dropZone.classList.add('active');
    }
    
    const dropBorder = document.createElement('div');
    dropBorder.className = 'drop-border';
    
    const dropMessage = document.createElement('div');
    dropMessage.className = 'drop-message';
    dropMessage.textContent = 'DROP IMAGE HERE';
    
    const dropHint = document.createElement('div');
    dropHint.className = 'drop-hint';
    dropHint.textContent = 'OR USE [⬆] LOAD BUTTON';
    
    dropZone.appendChild(dropBorder);
    dropZone.appendChild(dropMessage);
    dropZone.appendChild(dropHint);
    
    // File input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    dropZone.onclick = () => fileInput.click();
    
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.handleFile(file);
        dropZone.classList.remove('active');
      }
    };
    
    // Drag and drop
    dropZone.ondragover = (e) => {
      e.preventDefault();
      dropZone.classList.add('dragging');
    };
    
    dropZone.ondragleave = () => {
      dropZone.classList.remove('dragging');
    };
    
    dropZone.ondrop = (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragging');
      
      const file = e.dataTransfer?.files[0];
      if (file && file.type.startsWith('image/')) {
        this.handleFile(file);
        dropZone.classList.remove('active');
      }
    };
    
    this.shadowRoot!.appendChild(dropZone);
    this.shadowRoot!.appendChild(fileInput);
  }

  private handleFile(file: File) {
    const event = new CustomEvent('fileselected', { 
      detail: { file },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
    
    // Hide drop zone after file is selected
    const dropZone = this.shadowRoot!.querySelector('.drop-zone');
    dropZone?.classList.remove('active');
  }

  private handleLoadClick() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.handleFile(file);
      }
    };
    fileInput.click();
  }

  private handleExportClick() {
    const event = new CustomEvent('exportrequested', {
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  private async handleCopyClick() {
    if (!this.imageData) return;
    
    try {
      // Create a temporary canvas with the current image data
      const canvas = document.createElement('canvas');
      canvas.width = this.imageData.width;
      canvas.height = this.imageData.height;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(this.imageData, 0, 0);
      
      // Convert to blob and copy to clipboard
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          this.showNotification('Copied to clipboard!');
        }
      });
    } catch (error) {
      this.showNotification('Copy failed');
      console.error('Copy to clipboard failed:', error);
    }
  }

  private showNotification(message: string) {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 102, 204, 0.95);
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      pointer-events: none;
      z-index: 1000;
    `;
    notification.textContent = message;
    
    this.shadowRoot!.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 2000);
  }

  private updateImageInfo() {
    const imageInfo = this.shadowRoot!.getElementById('imageInfo');
    if (!imageInfo || !this.imageData) return;
    
    const zoomPercent = Math.round(this.scale * 100);
    imageInfo.innerHTML = `
      <div><strong>${this.imageData.width} × ${this.imageData.height}</strong></div>
      <div>Zoom: ${zoomPercent}%</div>
    `;
    imageInfo.classList.add('visible');
  }

  private showProcessing() {
    const indicator = this.shadowRoot!.getElementById('processingIndicator');
    indicator?.classList.add('visible');
  }

  private hideProcessing() {
    const indicator = this.shadowRoot!.getElementById('processingIndicator');
    indicator?.classList.remove('visible');
  }

  // Public method for external access
  public triggerCopy() {
    this.handleCopyClick();
  }
}

customElements.define('pixel-canvas', PixelCanvas);