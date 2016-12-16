'use strict';
export default class DigitalClock extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({mode: 'open'});
    this._onClick = this._onClick.bind(this);
  }
  connectedCallback() {
    this.root.innerHTML = `
  <style>
    :host {
      display: flex;
      height: 40px;
      align-items: center;
      flex-direction: row;
      padding: 8px;
      box-sizing: border-box;
      color: var(--digital-clock-color, #555);
    }
    :host([picker][picker-opened]){
      --digital-clock-color: #FFF;
    }
    .indicator {
      padding: 0 8px;
    }
  </style>
  <div class="hour"></div>
  <span class="indicator">:</span>
  <div class="minutes"></div>
    `;

    if (this.hasPicker) {
      this.picker = this.customPicker || this.defaultPicker;
      this.addEventListener('click', this._onClick);
    } else {
      // this.startClock
    }
  }

  get defaultPicker() {
    // TODO: lazy import
    return new TimePicker();
  }

  get customPicker() {
    return this._customPicker || this.getAttribute('custom-picker');
  }

  get hasPicker() {
    return this._hasPicker || this.hasAttribute('picker') || false;
  }

  get time() {
    return `${this.hour}:${this.minutes}`;
  }

  get hour() {
    return this._hour || '8';
  }

  get minutes() {
    return this._minutes || '00';
  }

  set customPicker(value) {
    this._customPicker = value;
  }

  /**
   * Setting to true, displays a time picker on click
   */
  set hasPicker(value) {
    this._hasPicker = value;
  }

  set hour(value) {
    this._applyTimeUpdate('.hour', value);
    this._hour = value;
  }

  set minutes(value) {
    this._applyTimeUpdate('.minutes', value);
    this._minutes = value;
  }

  _applyTimeUpdate(query, value) {
    let target = this.root.querySelector(query);
    requestAnimationFrame(() => {
      target.innerHTML = value;
    });
  }

  _onClick(event) {
    event.preventDefault();
    this.picker.opened = true;
  }
}
customElements.define('digital-clock', DigitalClock)
