import { eventBus, Events } from '../../lib/events/eventBus';
import { artistPalettes } from '../../palettes/artistPalettes';
import type { Palette, Color } from '../../types';

export class PaletteSelector extends HTMLElement {
  private selectedPalette: Palette | null = null;
  private palettes: Palette[] = artistPalettes;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.setupStyles();
    this.render();
    
    // Select first palette by default
    if (this.palettes.length > 0) {
      this.selectPalette(this.palettes[0]);
    }
  }

  private setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', system-ui, sans-serif;
      }

      .palette-container {
        display: flex;
        gap: 12px;
        padding: 16px;
        background: #F6F6F6;
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: #CCCCCC #F6F6F6;
      }

      .palette-container::-webkit-scrollbar {
        height: 16px;
      }

      .palette-container::-webkit-scrollbar-track {
        background: #E8E8E8;
      }

      .palette-container::-webkit-scrollbar-thumb {
        background: #CCCCCC;
        border: 2px solid #E8E8E8;
        box-shadow: inset 1px 1px 0 rgba(255,255,255,0.5);
      }

      .palette-container::-webkit-scrollbar-thumb:hover {
        background: #0066CC;
      }

      .palette-item {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 10px;
        background: #FFFFFF;
        border: 2px solid #CCCCCC;
        cursor: pointer;
        transition: all 0.1s ease;
        min-width: 120px;
        box-shadow: inset 1px 1px 0 rgba(255,255,255,0.8), inset -1px -1px 0 rgba(0,0,0,0.2);
      }

      .palette-item:hover {
        background: #E8E8E8;
        box-shadow: inset -1px -1px 0 rgba(255,255,255,0.5), inset 1px 1px 0 rgba(0,0,0,0.3);
      }

      .palette-item.selected {
        background: #0066CC;
        border-color: #0066CC;
        color: #FFFFFF;
        box-shadow: inset -1px -1px 0 rgba(255,255,255,0.3), inset 1px 1px 0 rgba(0,0,0,0.5);
      }

      .palette-colors {
        display: flex;
        gap: 2px;
        height: 24px;
        border-radius: 4px;
        overflow: hidden;
      }

      .palette-color {
        flex: 1;
        min-width: 8px;
        transition: transform 0.2s ease;
      }

      .palette-item:hover .palette-color {
        transform: scaleY(1.2);
      }

      .palette-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .palette-name {
        color: inherit;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        letter-spacing: -0.01em;
      }

      .palette-artist {
        color: inherit;
        opacity: 0.7;
        font-size: 11px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 400;
        letter-spacing: -0.01em;
      }

      .palette-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px 8px;
        background: #F6F6F6;
        border-bottom: 2px solid #CCCCCC;
        box-shadow: inset 1px 1px 0 rgba(255,255,255,0.8), inset -1px -1px 0 rgba(0,0,0,0.1);
      }

      .palette-title {
        color: #000000;
        font-size: 13px;
        letter-spacing: -0.01em;
        font-weight: 600;
      }

      .custom-palette-btn {
        padding: 6px 12px;
        background: #FFFFFF;
        border: 2px solid #CCCCCC;
        color: #000000;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        cursor: pointer;
        transition: all 0.1s ease;
        font-family: inherit;
        box-shadow: inset 1px 1px 0 rgba(255,255,255,0.8), inset -1px -1px 0 rgba(0,0,0,0.2);
      }

      .custom-palette-btn:hover {
        background: #0066CC;
        color: #FFFFFF;
        border-color: #0066CC;
        box-shadow: inset -1px -1px 0 rgba(255,255,255,0.3), inset 1px 1px 0 rgba(0,0,0,0.3);
      }
    `;
    
    this.shadowRoot!.appendChild(style);
  }

  private render() {
    const wrapper = document.createElement('div');
    
    // Header
    const header = document.createElement('div');
    header.className = 'palette-header';
    
    const title = document.createElement('div');
    title.className = 'palette-title';
    title.textContent = 'Color Palettes';
    
    const customBtn = document.createElement('button');
    customBtn.className = 'custom-palette-btn';
    customBtn.textContent = '+ Custom';
    customBtn.onclick = () => this.openCustomPaletteDialog();
    
    header.appendChild(title);
    header.appendChild(customBtn);
    
    // Palette container
    const container = document.createElement('div');
    container.className = 'palette-container';
    
    this.palettes.forEach(palette => {
      const item = this.createPaletteItem(palette);
      container.appendChild(item);
    });
    
    wrapper.appendChild(header);
    wrapper.appendChild(container);
    this.shadowRoot!.appendChild(wrapper);
  }

  private createPaletteItem(palette: Palette): HTMLElement {
    const item = document.createElement('div');
    item.className = 'palette-item';
    if (palette === this.selectedPalette) {
      item.classList.add('selected');
    }
    
    // Color preview
    const colorsDiv = document.createElement('div');
    colorsDiv.className = 'palette-colors';
    
    palette.colors.forEach(color => {
      const colorDiv = document.createElement('div');
      colorDiv.className = 'palette-color';
      colorDiv.style.backgroundColor = this.colorToRgb(color);
      colorsDiv.appendChild(colorDiv);
    });
    
    // Info
    const info = document.createElement('div');
    info.className = 'palette-info';
    
    const name = document.createElement('div');
    name.className = 'palette-name';
    name.textContent = palette.name;
    
    const artist = document.createElement('div');
    artist.className = 'palette-artist';
    artist.textContent = palette.artist || `${palette.colors.length} colors`;
    
    info.appendChild(name);
    info.appendChild(artist);
    
    item.appendChild(colorsDiv);
    item.appendChild(info);
    
    item.onclick = () => this.selectPalette(palette);
    
    return item;
  }

  private colorToRgb(color: Color): string {
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }

  private selectPalette(palette: Palette) {
    this.selectedPalette = palette;
    
    // Update UI
    const items = this.shadowRoot!.querySelectorAll('.palette-item');
    items.forEach((item, index) => {
      if (this.palettes[index] === palette) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
    
    // Emit event
    eventBus.emit(Events.PALETTE_CHANGED, { palette });
    
    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('palettechange', {
      detail: { palette },
      bubbles: true,
      composed: true
    }));
  }

  private openCustomPaletteDialog() {
    // TODO: Implement custom palette dialog
    console.log('Custom palette dialog not yet implemented');
  }

  getSelectedPalette(): Palette | null {
    return this.selectedPalette;
  }

  addCustomPalette(palette: Palette) {
    this.palettes.push(palette);
    this.render();
  }
}

customElements.define('palette-selector', PaletteSelector);