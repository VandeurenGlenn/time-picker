'use strict';
import TimePickerHour from './time-picker-hour';
export default class TimePickerPlate extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({mode: 'open'});
  }

  connectedCallback() {
    this.root.innerHTML = `
  <style>
    :host {
      position: relative;
      width: var(--time-picker-plate-size, 200px);
      height: var(--time-picker-plate-size, 200px);
      padding: 0;
      border-radius: 50%;
      list-style: none;
      font-size: 14px;
      line-height: 36px;
      padding: var(--time-picker-plate-padding, 160px 0 20px 0);
      margin: 0 auto;
    }
    :host::before {
     content: "";
     position: absolute;
     top: 0;
     left: -20px;
     width: 240px;
     height: 240px;
     background: var(--clock-background);
     border-radius: 50%;
   }
   .center {
     position: absolute;
     left: 50%;
     top: 50%;
     transform: translate(-50%, -50%);
     width: 10px;
     height: 10px;
     border-radius: 50%;
     background: var(--primary-color, #00bcd4);
   }
   .indicator {
    position: absolute;
    top: 80px;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    height: 86px;
    width: 2px;
    background: var(--primary-color, #00bcd4);
   }
   .indicator.show {
     opacity: 1;
   }
  </style>
  <div class="indicator"></div>
  <div class="center"></div>
    `;
  }

  set size(value) {
    this._size = value;
    this.style.setPropertyValue('--time-picker-plate-size', `${value}px`);
  }

	set timeFormat(value) {
		this._timeFormat = value;
    this._notifyTimePickerHourElements(value);
	}

  get size() {
    return this._size || 200;
  }

  /**
   * Returns current time format, options are 'am', 'pm' or 24 hours
   * @return {String|Number}
   */
  get timeFormat() {
		return this._timeFormat || 'am';
	}

  get _indicator() {
    return this.root.querySelector('.indicator');
  }

  get renderTwentyFourHoursNeeded() {
    if (this.timeFormat !== 'am' || this.timeFormat !== 'pm') {
      return true;
    }
    return false;
  }

  _notifyTimePickerHourElements(timeFormat) {
    const hourElements = document.querySelectorAll('time-picker-hour');
    for (let hourElement  of hourElements) {
      hourElement.timeFormat = timeFormat;
    }
  }
}
customElements.define('time-picker-plate', TimePickerPlate);
