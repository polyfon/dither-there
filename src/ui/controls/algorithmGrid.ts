import { eventBus, Events } from '../../lib/events/eventBus';
import type { DitherAlgorithm } from '../../core/ditherEngine';

interface AlgorithmInfo {
  id: DitherAlgorithm;
  name: string;
  icon: string;
  year: number;
  creator: string;
  description: string;
  technique: string;
}

export class AlgorithmGrid extends HTMLElement {
  private selectedAlgorithm: DitherAlgorithm = 'floyd-steinberg';
  private algorithms: AlgorithmInfo[] = [
    {
      id: 'floyd-steinberg',
      name: 'Floyd-Steinberg',
      icon: '⚡',
      year: 1976,
      creator: 'Robert Floyd & Louis Steinberg',
      description: 'Error diffusion pioneer that distributes quantization error to neighboring pixels. Most widely adopted due to excellent balance of speed and quality.',
      technique: 'Distributes 7/16 of error right, 3/16 bottom-left, 5/16 bottom, 1/16 bottom-right'
    },
    {
      id: 'ordered',
      name: 'Ordered/Bayer',
      icon: '▦',
      year: 1973,
      creator: 'Bryce Bayer',
      description: 'Uses pre-computed threshold matrices for consistent patterns. Developed at Kodak for color filter arrays, favored for screen printing and industrial applications.',
      technique: 'Applies recursive Bayer matrices (2×2, 4×4, 8×8) for deterministic patterns'
    },
    {
      id: 'atkinson',
      name: 'Atkinson',
      icon: '◈',
      year: 1984,
      creator: 'Bill Atkinson',
      description: 'Created for Apple MacPaint. Preserves fine detail and highlights better than Floyd-Steinberg by distributing only 6/8 of error, preventing over-darkening.',
      technique: 'Distributes error across 6 pixels in L-shaped pattern, leaves 2/8 error undistributed'
    },
    {
      id: 'sierra',
      name: 'Sierra',
      icon: '◉',
      year: 1990,
      creator: 'Frankie Sierra',
      description: 'Uses wider error distribution kernel for smoother gradient reproduction. Popular in scientific visualization and medical imaging applications.',
      technique: 'Distributes error across 10 pixels in two rows for enhanced smoothness'
    },
    {
      id: 'artistic',
      name: 'Artistic Patterns',
      icon: '✦',
      year: 2024,
      creator: 'Contemporary Synthesis',
      description: 'Combines traditional halftone techniques with modern computation. Includes crosshatching, stippling, and wave interference patterns inspired by printmaking.',
      technique: 'Procedural pattern generation using cellular automata and L-systems'
    }
  ];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.setupStyles();
    this.render();
  }

  private setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', system-ui, sans-serif;
      }

      .algorithm-section {
        background: #FFFFFF;
        border: 2px solid #CCCCCC;
        box-shadow: inset 1px 1px 0 rgba(255,255,255,0.8), inset -1px -1px 0 rgba(0,0,0,0.2);
      }

      .section-header {
        background: #F6F6F6;
        border-bottom: 2px solid #CCCCCC;
        padding: 16px 20px;
        font-size: 13px;
        font-weight: 600;
        color: #000000;
        letter-spacing: -0.01em;
        box-shadow: inset 1px 1px 0 rgba(255,255,255,0.8), inset -1px -1px 0 rgba(0,0,0,0.1);
      }

      .algorithm-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2px;
        padding: 2px;
        background: #CCCCCC;
      }

      .algorithm-cell {
        aspect-ratio: 1;
        background: #F6F6F6;
        border: 2px solid #CCCCCC;
        color: #666666;
        font-size: 24px;
        cursor: pointer;
        transition: all 0.1s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: inherit;
        position: relative;
        box-shadow: inset 1px 1px 0 rgba(255,255,255,0.8), inset -1px -1px 0 rgba(0,0,0,0.2);
      }

      .algorithm-cell:hover {
        background: #E8E8E8;
        color: #000000;
        box-shadow: inset -1px -1px 0 rgba(255,255,255,0.5), inset 1px 1px 0 rgba(0,0,0,0.3);
      }

      .algorithm-cell.selected {
        background: #0066CC;
        color: #FFFFFF;
        border-color: #0066CC;
        box-shadow: inset -1px -1px 0 rgba(255,255,255,0.3), inset 1px 1px 0 rgba(0,0,0,0.5);
      }

      .algorithm-cell.selected::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 2px solid #0066CC;
        animation: pulse-border 2s infinite;
      }

      @keyframes pulse-border {
        0%, 100% { 
          border-color: #0066CC; 
          opacity: 1;
        }
        50% { 
          border-color: #0099FF; 
          opacity: 0.7;
        }
      }

      .description-section {
        background: #FFFFFF;
        border: 2px solid #CCCCCC;
        border-top: none;
        min-height: 200px;
        box-shadow: inset 1px 1px 0 rgba(255,255,255,0.8), inset -1px -1px 0 rgba(0,0,0,0.1);
      }

      .description-header {
        background: #F6F6F6;
        border-bottom: 2px solid #CCCCCC;
        padding: 16px 20px;
        font-size: 13px;
        font-weight: 600;
        color: #000000;
        letter-spacing: -0.01em;
        box-shadow: inset 1px 1px 0 rgba(255,255,255,0.8), inset -1px -1px 0 rgba(0,0,0,0.1);
      }

      .description-content {
        padding: 20px;
        color: #000000;
        line-height: 1.5;
      }

      .algorithm-title {
        color: #0066CC;
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 6px;
        letter-spacing: -0.02em;
      }

      .algorithm-meta {
        color: #666666;
        font-size: 13px;
        margin-bottom: 16px;
        font-weight: 500;
        letter-spacing: -0.01em;
      }

      .algorithm-desc {
        font-size: 14px;
        margin-bottom: 16px;
        line-height: 1.6;
        color: #333333;
      }

      .algorithm-technique {
        font-size: 13px;
        color: #666666;
        border-left: 3px solid #0066CC;
        padding-left: 16px;
        font-style: italic;
        line-height: 1.5;
        background: rgba(0, 102, 204, 0.05);
        padding: 12px 16px;
        border-radius: 0 4px 4px 0;
      }

      .empty-state {
        padding: 32px 16px;
        text-align: center;
        color: #666666;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    `;
    
    this.shadowRoot!.appendChild(style);
  }

  private render() {
    const container = document.createElement('div');
    
    // Algorithm grid section
    const algorithmSection = document.createElement('div');
    algorithmSection.className = 'algorithm-section';
    
    const algorithmHeader = document.createElement('div');
    algorithmHeader.className = 'section-header';
    algorithmHeader.textContent = 'ALGORITHMS';
    
    const grid = document.createElement('div');
    grid.className = 'algorithm-grid';
    
    this.algorithms.forEach(algo => {
      const cell = document.createElement('button');
      cell.className = 'algorithm-cell';
      if (algo.id === this.selectedAlgorithm) {
        cell.classList.add('selected');
      }
      
      cell.textContent = algo.icon;
      cell.title = `${algo.name} (${algo.year})`;
      
      cell.onclick = () => this.selectAlgorithm(algo.id);
      
      grid.appendChild(cell);
    });
    
    // Fill empty cells
    const totalCells = 8; // 4x2 grid
    for (let i = this.algorithms.length; i < totalCells; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'algorithm-cell';
      emptyCell.style.cursor = 'default';
      emptyCell.style.opacity = '0.3';
      grid.appendChild(emptyCell);
    }
    
    algorithmSection.appendChild(algorithmHeader);
    algorithmSection.appendChild(grid);
    
    // Description section
    const descriptionSection = document.createElement('div');
    descriptionSection.className = 'description-section';
    
    const descriptionHeader = document.createElement('div');
    descriptionHeader.className = 'description-header';
    descriptionHeader.textContent = 'DESCRIPTION';
    
    const descriptionContent = document.createElement('div');
    descriptionContent.className = 'description-content';
    
    descriptionSection.appendChild(descriptionHeader);
    descriptionSection.appendChild(descriptionContent);
    
    container.appendChild(algorithmSection);
    container.appendChild(descriptionSection);
    
    this.shadowRoot!.appendChild(container);
    
    // Update description for initially selected algorithm
    this.updateDescription();
  }

  private selectAlgorithm(algorithm: DitherAlgorithm) {
    this.selectedAlgorithm = algorithm;
    
    // Update UI
    const cells = this.shadowRoot!.querySelectorAll('.algorithm-cell');
    cells.forEach((cell, index) => {
      if (index < this.algorithms.length && this.algorithms[index].id === algorithm) {
        cell.classList.add('selected');
      } else {
        cell.classList.remove('selected');
      }
    });
    
    this.updateDescription();
    
    // Emit events
    eventBus.emit(Events.ALGORITHM_CHANGED, { algorithm });
    
    this.dispatchEvent(new CustomEvent('algorithmchange', {
      detail: { algorithm },
      bubbles: true,
      composed: true
    }));
  }

  private updateDescription() {
    const algo = this.algorithms.find(a => a.id === this.selectedAlgorithm);
    const content = this.shadowRoot!.querySelector('.description-content');
    
    if (!content || !algo) return;
    
    content.innerHTML = `
      <div class="algorithm-title">${algo.name}</div>
      <div class="algorithm-meta">${algo.year} • ${algo.creator}</div>
      <div class="algorithm-desc">${algo.description}</div>
      <div class="algorithm-technique">TECHNIQUE: ${algo.technique}</div>
    `;
  }

  getSelectedAlgorithm(): DitherAlgorithm {
    return this.selectedAlgorithm;
  }
}

customElements.define('algorithm-grid', AlgorithmGrid);