'use strict';
import TimePickerHour from './time-picker-hour';
export default class TimePickerPlate extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({mode: 'open'});
    this._onHourSelect = this._onHourSelect.bind(this);
    this._onHourIndicating = this._onHourIndicating.bind(this);
    this._onHourMouseOut = this._onHourMouseOut.bind(this);
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
      padding: 160px 0 20px 0;
      margin: 0 auto;
    }
    :host::before {
     content: "";
     position: absolute;
     top: 70px;
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
     transform: translate(-50%, -50%) rotate(180deg);
     width: 10px;
     height: 10px;
     border-radius: 50%;
     background: var(--primary-color, #00bcd4);
   }
   .indicator {
    position: absolute;
    top: 150px;
    left: 50%;
    transform: translate(-50%, -50%);
    // margin-top: -43px;
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
    this._setupHours();
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

  get hourSet() {
    return [
      [3, 0, 90],
      [4, 30, 120],
      [5, 60, 150],
      [6, 90, 180],
      [7, 120, 210],
      [8, 150, 240],
      [9, 180, 270],
      [10, 210, 300],
      [11, 240, 330],
      [12, 270, 0],
      [1, 300, 30],
      [2, 330, 60]
    ];
  }

  _setupHours() {
    let hours = this.hourSet;
    // Promise.all([hourTasks])
    for (let hour of hours) {
      let timePickerHour = new TimePickerHour();
      timePickerHour.transform(hour[1]);
      timePickerHour.hour = hour[0];
      timePickerHour.plateSize = this.size;
      timePickerHour.addEventListener('hour-select',
        this._onHourSelect
      );
      timePickerHour.addEventListener('hour-indicating', this._onHourIndicating);
      timePickerHour.addEventListener('mouseout', this._onHourMouseOut);
      requestAnimationFrame(() => {
        this.root.appendChild(timePickerHour);
      });
    }
  }

  _onHourIndicating(event) {
    let detail = event.detail;
    for (let hour of this.hourSet) {
      let marginTop = 0;
      let marginLeft = 0;
      if (hour[0] === detail.hour) {
        if (hour[0] >= 1 && hour[0] < 3) {
          marginLeft = '-1px';
        } else if (hour[0] === 3) {
          marginTop = '-2px';
        } else if (hour[0] > 3 && hour[0] < 6) {
          marginTop = '-2px';
          marginLeft = '-2px';
        } else if (hour[0] === 6) {
          marginLeft = '-2px';
        } else if (hour[0] > 6 && hour[0] < 9) {
          marginTop = `-3px`;
          marginLeft = '-3px';
        } else if (hour[0] === 9) {
          marginTop = `-4px`;
        } else if (hour[0] > 9 && hour[0] < 12) {
          marginTop = `-3px`;
        }
        requestAnimationFrame(() => {
          this._indicator.style.marginLeft = marginLeft;
          this._indicator.style.marginTop = marginTop;
          this._indicator.style.transform = `rotate(${hour[2]}deg) translate(-50%, -50%)`;
        });
      }
    }
    this._indicator.classList.add('show');
  }

  _onHourMouseOut() {
    this._indicator.classList.remove('show');
  }

  _onHourSelect(event) {
    this.dispatchEvent(new CustomEvent('update-hour', {detail: event.detail}));
  }

  _notifyTimePickerHourElements(timeFormat) {
    const hourElements = document.querySelectorAll('time-picker-hour');
    for (let hourElement  of hourElements) {
      hourElement.timeFormat = timeFormat;
    }
  }
}
customElements.define('time-picker-plate', TimePickerPlate);
