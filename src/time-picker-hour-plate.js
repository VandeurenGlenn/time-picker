'use strict';
import TimePickerHour from './time-picker-hour';
import TimePickerPlate from './time-picker-plate';
export default class TimePickerHourPlate extends TimePickerPlate {
  constructor() {
    super();
    this._onHourSelect = this._onHourSelect.bind(this);
    this._onHourIndicating = this._onHourIndicating.bind(this);
    this._onHourMouseOut = this._onHourMouseOut.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this._setupHours();
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
    let twentyFourHours = this.renderTwentyFourHoursNeeded;
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

      if (twentyFourHours) {
        hour[0] = (hour[0] + 12);
        let europeanTimePickerHour = new TimePickerHour();
        europeanTimePickerHour.plateSize = (this.size - 72);
        europeanTimePickerHour.transform(hour[1]);
        europeanTimePickerHour.hour = hour[0];
        europeanTimePickerHour.addEventListener('hour-select',
          this._onHourSelect);
        europeanTimePickerHour.addEventListener('hour-indicating',
          this._onHourIndicating);
        europeanTimePickerHour.addEventListener('mouseout', this._onHourMouseOut);

        requestAnimationFrame(() => {
          this.root.appendChild(europeanTimePickerHour);
        });
      }
    }
  }

  _querySelectDigit(number) {
    let query = `time-picker-hour[digit-value="${number}"]`;
    return this.root.querySelector(query);
  }

  _onHourIndicating(event) {
    let hour = event.detail.hour;
    let height = 86;
    let top = 80;
    let digitOverIndicator;
    if (hour > 12) {
      hour -= 12;
      height -= 36;
      top += 18;
    } else {
      // set the current digit the hide
      digitOverIndicator = hour;
      digitOverIndicator += 12;
    }
    this._hideDigitUnderIndicator(digitOverIndicator);
    this._rerenderIndicator(hour, height, top);
    this._indicator.classList.add('show');
  }

  _hideDigitUnderIndicator(digit) {
    if (digit) {
      digit = this._querySelectDigit(digit);
      digit.style.opacity = 0;
      this._lastUnderIndicator = digit;
    }
  }

  _rerenderIndicator(_hour, height, top) {
    for (let hour of this.hourSet) {
      let marginTop = 0;
      let marginLeft = 0;
      if (hour[0] === _hour) {
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
          this._indicator.style.height = `${height}px`;
          this._indicator.style.top = `${top}px`;
          this._indicator.style.transform = `rotate(${hour[2]}deg) translate(-50%, -50%)`;
        });
      }
    }
  }

  _onHourMouseOut() {
    this._indicator.classList.remove('show');
    if (this._lastUnderIndicator) {
      this._lastUnderIndicator.style.opacity = 1;
      this._lastUnderIndicator = undefined;
    }
  }

  _onHourSelect(event) {
    this.dispatchEvent(new CustomEvent('update-hour', {detail: event.detail}));
  }
}
customElements.define('time-picker-hour-plate', TimePickerHourPlate);
