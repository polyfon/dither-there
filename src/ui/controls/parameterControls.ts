import { eventBus, Events } from '../../lib/events/eventBus';

export class ParameterControls extends HTMLElement {
  private strengthValue: number = 1.0;
  private contrastValue: number = 0;
  private brightnessValue: number = 0;
  
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

      .parameter-section {
        background: #FFFFFF;
        border: 2px solid #CCCCCC;
        border-top: none;
        box-shadow: inset 1px 1px 0 rgba(255,255,255,0.8), inset -1px -1px 0 rgba(0,0,0,0.1);
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

      .parameters-content {
        padding: 20px;
      }

      .parameter-group {
        margin-bottom: 24px;
      }

      .parameter-label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: #333333;
        margin-bottom: 8px;
        letter-spacing: -0.01em;
      }

      .slider-container {
        position: relative;
        margin-bottom: 4px;
      }

      .parameter-slider {
        width: 100%;
        height: 6px;
        -webkit-appearance: none;
        appearance: none;
        background: #E8E8E8;
        border: 1px solid #CCCCCC;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .parameter-slider:hover {
        background: #E0E0E0;
      }

      .parameter-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        background: #0066CC;
        cursor: pointer;
        border-radius: 50%;
        border: 2px solid #FFFFFF;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.3);
        transition: all 0.15s ease;
      }

      .parameter-slider::-webkit-slider-thumb:hover {
        background: #0080FF;
        transform: scale(1.1);
      }

      .parameter-slider::-moz-range-thumb {
        width: 16px;
        height: 16px;
        background: #0066CC;
        cursor: pointer;
        border-radius: 50%;
        border: 2px solid #FFFFFF;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: all 0.15s ease;
      }

      .parameter-value {
        font-size: 12px;
        color: #0066CC;
        font-weight: 600;
        text-align: right;
        min-width: 50px;
        letter-spacing: -0.01em;
      }

      .parameter-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .toggle-container {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 16px;
      }

      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
      }

      .toggle-input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #CCCCCC;
        transition: 0.3s;
        border-radius: 24px;
        border: 2px solid #CCCCCC;
      }

      .toggle-slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      }

      .toggle-input:checked + .toggle-slider {
        background-color: #0066CC;
        border-color: #0066CC;
      }

      .toggle-input:checked + .toggle-slider:before {
        transform: translateX(20px);
      }

      .toggle-label {
        font-size: 13px;
        color: #333333;
        font-weight: 500;
        letter-spacing: -0.01em;
      }

      .shortcut-hint {
        background: rgba(0, 102, 204, 0.05);
        border: 1px solid rgba(0, 102, 204, 0.2);
        border-radius: 4px;
        padding: 12px;
        margin-top: 16px;
      }

      .shortcut-title {
        font-size: 12px;
        font-weight: 600;
        color: #0066CC;
        margin-bottom: 8px;
        letter-spacing: -0.01em;
      }

      .shortcut-list {
        font-size: 11px;
        color: #666666;
        line-height: 1.5;
      }

      .shortcut-key {
        background: #E8E8E8;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: monospace;
        font-weight: 600;
      }
    `;
    
    this.shadowRoot!.appendChild(style);
  }

  private render() {
    const container = document.createElement('div');
    
    const section = document.createElement('div');
    section.className = 'parameter-section';
    
    const header = document.createElement('div');
    header.className = 'section-header';
    header.textContent = 'Parameters';
    
    const content = document.createElement('div');
    content.className = 'parameters-content';
    
    // Strength parameter
    const strengthGroup = document.createElement('div');
    strengthGroup.className = 'parameter-group';
    
    const strengthLabel = document.createElement('label');
    strengthLabel.className = 'parameter-label';
    strengthLabel.textContent = 'Dither Strength';
    
    const strengthRow = document.createElement('div');
    strengthRow.className = 'parameter-row';
    
    const strengthContainer = document.createElement('div');
    strengthContainer.className = 'slider-container';
    strengthContainer.style.flex = '1';
    
    const strengthSlider = document.createElement('input');
    strengthSlider.type = 'range';
    strengthSlider.className = 'parameter-slider';
    strengthSlider.min = '0';
    strengthSlider.max = '100';
    strengthSlider.value = '100';
    
    const strengthValue = document.createElement('span');
    strengthValue.className = 'parameter-value';
    strengthValue.textContent = '100%';
    
    strengthSlider.oninput = () => {
      const value = parseInt(strengthSlider.value);
      this.strengthValue = value / 100;
      strengthValue.textContent = `${value}%`;
      this.emitParameterChange();
    };
    
    strengthContainer.appendChild(strengthSlider);
    strengthRow.appendChild(strengthContainer);
    strengthRow.appendChild(strengthValue);
    
    strengthGroup.appendChild(strengthLabel);
    strengthGroup.appendChild(strengthRow);
    
    // Contrast parameter
    const contrastGroup = document.createElement('div');
    contrastGroup.className = 'parameter-group';
    
    const contrastLabel = document.createElement('label');
    contrastLabel.className = 'parameter-label';
    contrastLabel.textContent = 'Contrast';
    
    const contrastRow = document.createElement('div');
    contrastRow.className = 'parameter-row';
    
    const contrastContainer = document.createElement('div');
    contrastContainer.className = 'slider-container';
    contrastContainer.style.flex = '1';
    
    const contrastSlider = document.createElement('input');
    contrastSlider.type = 'range';
    contrastSlider.className = 'parameter-slider';
    contrastSlider.min = '-50';
    contrastSlider.max = '50';
    contrastSlider.value = '0';
    
    const contrastValue = document.createElement('span');
    contrastValue.className = 'parameter-value';
    contrastValue.textContent = '0';
    
    contrastSlider.oninput = () => {
      const value = parseInt(contrastSlider.value);
      this.contrastValue = value;
      contrastValue.textContent = value > 0 ? `+${value}` : `${value}`;
      this.emitParameterChange();
    };
    
    contrastContainer.appendChild(contrastSlider);
    contrastRow.appendChild(contrastContainer);
    contrastRow.appendChild(contrastValue);
    
    contrastGroup.appendChild(contrastLabel);
    contrastGroup.appendChild(contrastRow);
    
    // Brightness parameter
    const brightnessGroup = document.createElement('div');
    brightnessGroup.className = 'parameter-group';
    
    const brightnessLabel = document.createElement('label');
    brightnessLabel.className = 'parameter-label';
    brightnessLabel.textContent = 'Brightness';
    
    const brightnessRow = document.createElement('div');
    brightnessRow.className = 'parameter-row';
    
    const brightnessContainer = document.createElement('div');
    brightnessContainer.className = 'slider-container';
    brightnessContainer.style.flex = '1';
    
    const brightnessSlider = document.createElement('input');
    brightnessSlider.type = 'range';
    brightnessSlider.className = 'parameter-slider';
    brightnessSlider.min = '-50';
    brightnessSlider.max = '50';
    brightnessSlider.value = '0';
    
    const brightnessValue = document.createElement('span');
    brightnessValue.className = 'parameter-value';
    brightnessValue.textContent = '0';
    
    brightnessSlider.oninput = () => {
      const value = parseInt(brightnessSlider.value);
      this.brightnessValue = value;
      brightnessValue.textContent = value > 0 ? `+${value}` : `${value}`;
      this.emitParameterChange();
    };
    
    brightnessContainer.appendChild(brightnessSlider);
    brightnessRow.appendChild(brightnessContainer);
    brightnessRow.appendChild(brightnessValue);
    
    brightnessGroup.appendChild(brightnessLabel);
    brightnessGroup.appendChild(brightnessRow);
    
    // Real-time preview toggle
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'toggle-container';
    
    const toggleSwitch = document.createElement('label');
    toggleSwitch.className = 'toggle-switch';
    
    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.className = 'toggle-input';
    toggleInput.checked = true;
    
    const toggleSlider = document.createElement('span');
    toggleSlider.className = 'toggle-slider';
    
    const toggleLabel = document.createElement('span');
    toggleLabel.className = 'toggle-label';
    toggleLabel.textContent = 'Real-time Preview';
    
    toggleSwitch.appendChild(toggleInput);
    toggleSwitch.appendChild(toggleSlider);
    
    toggleContainer.appendChild(toggleSwitch);
    toggleContainer.appendChild(toggleLabel);
    
    // Keyboard shortcuts hint
    const shortcutHint = document.createElement('div');
    shortcutHint.className = 'shortcut-hint';
    
    const shortcutTitle = document.createElement('div');
    shortcutTitle.className = 'shortcut-title';
    shortcutTitle.textContent = 'Keyboard Shortcuts';
    
    const shortcutList = document.createElement('div');
    shortcutList.className = 'shortcut-list';
    shortcutList.innerHTML = `
      <span class="shortcut-key">Space</span> Toggle Original/Processed<br>
      <span class="shortcut-key">E</span> Export Image<br>
      <span class="shortcut-key">C</span> Copy to Clipboard<br>
      <span class="shortcut-key">R</span> Reset Parameters<br>
      <span class="shortcut-key">1-5</span> Select Algorithm
    `;
    
    shortcutHint.appendChild(shortcutTitle);
    shortcutHint.appendChild(shortcutList);
    
    content.appendChild(strengthGroup);
    content.appendChild(contrastGroup);
    content.appendChild(brightnessGroup);
    content.appendChild(toggleContainer);
    content.appendChild(shortcutHint);
    
    section.appendChild(header);
    section.appendChild(content);
    container.appendChild(section);
    
    this.shadowRoot!.appendChild(container);
  }

  private emitParameterChange() {
    const detail = {
      strength: this.strengthValue,
      contrast: this.contrastValue,
      brightness: this.brightnessValue
    };
    
    this.dispatchEvent(new CustomEvent('parameterchange', {
      detail,
      bubbles: true,
      composed: true
    }));
    
    eventBus.emit(Events.PARAMETER_CHANGED, detail);
  }

  getParameters() {
    return {
      strength: this.strengthValue,
      contrast: this.contrastValue,
      brightness: this.brightnessValue
    };
  }
}

customElements.define('parameter-controls', ParameterControls);