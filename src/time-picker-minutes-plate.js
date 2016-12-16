'use strict';
import TimePickerHour from './time-picker-hour';
import TimePickerPlate from './time-picker-plate';
export default class TimePickerMinutesPlate extends TimePickerPlate {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this._setupMinutes();
  }

  set size(value) {
    super.size = value;
    this._size = value;
    this.style.setPropertyValue('--time-picker-plate-size', `${value}px`);
  }

  get size() {
    return this._size || 200;
  }

  get _indicator() {
    return this.root.querySelector('.indicator');
  }

  get minutesSet() {
    return [
      [15, 0, 90],
      [16, 6, 96],
      [17, 12, 102],
      [18, 18, 108],
      [19, 24, 114],
      [20, 30, 120],
      [21, 36, 126],
      [22, 42, 132],
      [23, 48, 138],
      [24, 54, 144],
      [25, 60, 150],
      [26, 66, 156],
      [27, 72, 162],
      [28, 78, 168],
      [29, 84, 174],
      [30, 90, 180],
      [31, 96, 186],
      [32, 102, 192],
      [33, 108, 198],
      [34, 114, 204],
      [35, 120, 210],
      [36, 126, 216],
      [37, 132, 222],
      [38, 138, 228],
      [39, 144, 234],
      [40, 150, 240],
      [41, 156, 246],
      [42, 162, 252],
      [43, 168, 258],
      [44, 174, 264],
      [45, 180, 270],
      [46, 186, 276],
      [47, 192, 282],
      [48, 198, 288],
      [49, 204, 294],
      [50, 210, 300],
      [51, 216, 306],
      [52, 222, 312],
      [53, 228, 318],
      [54, 234, 324],
      [55, 240, 330],
      [56, 246, 336],
      [57, 252, 342],
      [58, 258, 348],
      [59, 264, 354],
      [60, 270, 0],
      [1, 276, 6],
      [2, 282, 12],
      [3, 288, 18],
      [4, 294, 24],
      [5, 300, 30],
      [6, 306, 36],
      [7, 312, 42],
      [8, 318, 48],
      [9, 324, 54],
      [10, 330, 60],
      [11, 336, 66],
      [12, 342, 72],
      [13, 348, 78],
      [14, 354, 84]
    ];
  }

  _setupMinutes() {
    let hours = this.minutesSet;
    // Promise.all([hourTasks])
    for (let hour of hours) {
      let timePickerHour = new TimePickerHour();
      timePickerHour.transform(hour[1]);
      timePickerHour.hour = hour[0];
      timePickerHour.plateSize = this.size;
      if (hour[0] !== 5 && hour[0] !== 10 && hour[0] !== 15 &&
          hour[0] !== 20 && hour[0] !== 25 && hour[0] !== 30 &&
          hour[0] !== 35 && hour[0] !== 40 && hour[0] !== 45 &&
          hour[0] !== 50 && hour[0] !== 55 && hour[0] !== 60) {
        timePickerHour.root.querySelector('.container').innerHTML = '';
        timePickerHour.style.width = '18px';
        timePickerHour.style.height = '18px';
        timePickerHour.style.margin = '-9px';
      } else {
        timePickerHour.hour = hour[0];
      }
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
    let hour = event.detail.hour;
    this._rerenderIndicator(hour);
    this._indicator.classList.add('show');
  }

  _rerenderIndicator(_minute) {
    for (let minute of this.minutesSet) {
      let marginTop = 0;
      let marginLeft = 0;
      if (minute[0] === _minute) {
        if (minute[0] >= 5 && minute[0] < 15) {
          marginLeft = '-1px';
        } else if (minute[0] === 15) {
          marginTop = '-2px';
        } else if (minute[0] > 15 && minute[0] < 30) {
          marginTop = '-2px';
          marginLeft = '-2px';
        } else if (minute[0] === 30) {
          marginLeft = '-2px';
        } else if (minute[0] > 30 && minute[0] < 45) {
          marginTop = `-3px`;
          marginLeft = '-3px';
        } else if (minute[0] === 45) {
          marginTop = `-4px`;
        } else if (minute[0] > 45 && minute[0] < 60) {
          marginTop = `-3px`;
        }
        requestAnimationFrame(() => {
          this._indicator.style.marginLeft = marginLeft;
          this._indicator.style.marginTop = marginTop;
          this._indicator.style.transform = `rotate(${minute[2]}deg) translate(-50%, -50%)`;
        });
      }
    }
  }

  _onHourMouseOut() {
    this._indicator.classList.remove('show');
  }

  _onHourSelect(event) {
    this.dispatchEvent(new CustomEvent('update-minutes', {detail: event.detail}));
  }
}
customElements.define('time-picker-minutes-plate', TimePickerMinutesPlate);
