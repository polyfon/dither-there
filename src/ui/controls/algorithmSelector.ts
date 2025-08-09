import { eventBus, Events } from '../../lib/events/eventBus';
import type { DitherAlgorithm } from '../../core/ditherEngine';

interface AlgorithmOption {
  id: DitherAlgorithm;
  name: string;
  icon: string;
}

export class AlgorithmSelector extends HTMLElement {
  private selectedAlgorithm: DitherAlgorithm = 'floyd-steinberg';
  private algorithms: AlgorithmOption[] = [
    { id: 'floyd-steinberg', name: 'Floyd', icon: '⚡' },
    { id: 'ordered', name: 'Ordered', icon: '▦' },
    { id: 'atkinson', name: 'Atkinson', icon: '◈' },
    { id: 'sierra', name: 'Sierra', icon: '◉' },
    { id: 'artistic', name: 'Artistic', icon: '✦' }
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
      }

      .algorithm-selector {
        display: flex;
        gap: 8px;
        background: rgba(26, 26, 26, 0.95);
        padding: 12px;
        border-radius: 12px;
        backdrop-filter: blur(10px);
      }

      .algorithm-button {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid transparent;
        border-radius: 8px;
        color: #888;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
      }

      .algorithm-button:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ccc;
        transform: translateY(-2px);
      }

      .algorithm-button.selected {
        background: rgba(0, 255, 136, 0.1);
        border-color: #00ff88;
        color: #00ff88;
      }

      .algorithm-button.selected::after {
        content: '';
        position: absolute;
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
        width: 4px;
        height: 4px;
        background: #00ff88;
        border-radius: 50%;
        box-shadow: 0 0 10px #00ff88;
      }

      .algorithm-icon {
        font-size: 24px;
        line-height: 1;
      }

      .algorithm-name {
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    `;
    
    this.shadowRoot!.appendChild(style);
  }

  private render() {
    const container = document.createElement('div');
    container.className = 'algorithm-selector';
    
    this.algorithms.forEach(algo => {
      const button = document.createElement('button');
      button.className = 'algorithm-button';
      if (algo.id === this.selectedAlgorithm) {
        button.classList.add('selected');
      }
      
      const icon = document.createElement('div');
      icon.className = 'algorithm-icon';
      icon.textContent = algo.icon;
      
      const name = document.createElement('div');
      name.className = 'algorithm-name';
      name.textContent = algo.name;
      
      button.appendChild(icon);
      button.appendChild(name);
      
      button.onclick = () => this.selectAlgorithm(algo.id);
      
      container.appendChild(button);
    });
    
    this.shadowRoot!.appendChild(container);
  }

  private selectAlgorithm(algorithm: DitherAlgorithm) {
    this.selectedAlgorithm = algorithm;
    
    // Update UI
    const buttons = this.shadowRoot!.querySelectorAll('.algorithm-button');
    buttons.forEach((button, index) => {
      if (this.algorithms[index].id === algorithm) {
        button.classList.add('selected');
      } else {
        button.classList.remove('selected');
      }
    });
    
    // Emit event
    eventBus.emit(Events.ALGORITHM_CHANGED, { algorithm });
    
    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('algorithmchange', {
      detail: { algorithm },
      bubbles: true,
      composed: true
    }));
  }

  getSelectedAlgorithm(): DitherAlgorithm {
    return this.selectedAlgorithm;
  }
}

customElements.define('algorithm-selector', AlgorithmSelector);