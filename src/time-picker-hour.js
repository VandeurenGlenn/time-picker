'use strict';
export default class TimePickerHour extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({mode: 'open'});
    this.root.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 50%;
      left: 50%;
      width: 36px;
      height: 36px;
      margin: -18px;
      cursor: pointer;
      will-change: transform;
      border-radius: 50%;
      z-index: 0;
      user-select: none;
    }
    .bubble {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      width: 100%;
      height: 100%;
      border-radius: 50%;
      z-index: 0;
      opacity: 0;
      transition: transform ease-out 64ms, opacity ease-out 16ms;
    }
    :host(:hover) .bubble {
      opacity: 1;
      background: var(--primary-color, #00bcd4);
      transform: translate(-50%, -50%) scale(1);
      transition: transform ease-in 100ms, opacity ease-in 16ms;
    }
    .container {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }
  </style>
  <slot></slot>
  <div class="bubble"></div>
  <div class="container"></div>
    `;
    this._onClick= this._onClick.bind(this);
    this._renderHour = this._renderHour.bind(this);
  }

  set timeFormat(value) {
    this._timeFormat = value;
    this._renderHour();
  }

  get timeFormat() {
    return this._timeFormat || 'am';
  }

  get _container() {
    return this.root.querySelector('.container');
  }

  set hour(value) {
    this._hour = value;
    this._renderHour();
  }

  set plateSize(value) {
    this._plateSize = value;
  }

  get hour() {
    return this._hour;
  }

  get plateSize() {
    return this._plateSize || 200;
  }

  connectedCallback() {
    this.addEventListener('click', this._onClick);
    this.addEventListener('mouseover', this._mouseOver);
  }

  transform(deg) {
    let x = this.plateSize / 2;
    this.style.transform = `rotate(${deg}deg) translate(${x}px) rotate(-${deg}deg)`;
  }

  _renderHour() {
    let hour = this.hour;
    if (this.timeFormat !== 'am') {
      hour += 12;
    }
    this._container.innerHTML = hour;
  }

  _onClick(event) {
    event.preventDefault();
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('hour-select', {
      detail: this.hour
    }));
  }

  _mouseOver(event) {
    this.dispatchEvent(new CustomEvent('hour-indicating', {
      detail: {
        target: this,
        hour: Number(this.hour)
      }
    }));
  }
}
customElements.define('time-picker-hour', TimePickerHour);
