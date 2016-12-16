'use strict';
import TimePickerHour from './time-picker-hour';
import TimePickerPlate from './time-picker-plate';
export default class TimePickerHourPlate extends TimePickerPlate {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this._setupHours();
  }

  set size(value) {
    super.size = value;
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

  get renderTwentyFourHoursNeeded() {
    if (this.timeFormat !== 'am' || this.timeFormat !== 'pm') {
      return true;
    }
    return false;
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

  _onHourIndicating(event) {
    let hour = event.detail.hour;
    let height = 86;
    let top = 80;
    if (hour > 12) {
      console.log(hour);
      hour -= 12;
      height -= 36;
      top += 18;
    }
    this._rerenderIndicator(hour, height, top);
    this._indicator.classList.add('show');
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
customElements.define('time-picker-hour-plate', TimePickerHourPlate);
