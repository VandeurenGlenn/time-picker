'use strict';

class TimePickerHour extends HTMLElement {
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
      detail: this._container.innerHTML
    }));
  }

  _mouseOver(event) {
    this.dispatchEvent(new CustomEvent('hour-indicating', {
      detail: {
        target: this,
        hour: Number(this._container.innerHTML)
      }
    }));
  }
}
customElements.define('time-picker-hour', TimePickerHour);

class TimePickerPlate extends HTMLElement {
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

class DigitalClock extends HTMLElement {
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
customElements.define('digital-clock', DigitalClock);

/**
 * @extends HTMLElement
 */
class TimePicker$1 extends HTMLElement {
  /**
   * Attributes to observer
   * @return {Array} []
   */
  static get observedAttributes() {
    return [];
  }

  /**
   * Calls super
   */
  constructor() {
   super();
   this.root = this.attachShadow({mode: 'open'});
   this._onUpdateHour = this._onUpdateHour.bind(this);
  }

  /**
   * Stamps innerHTML
   */
  connectedCallback() {
    this.root.innerHTML = `
       <style>
         :host {
           display: flex;
					 flex-direction: column;
					 width: 100%;
					 max-width: 320px;
					 box-shadow: 0 14px 45px rgba(0, 0, 0, 0.25),
					 						 0 10px 18px rgba(0, 0, 0, 0.22);
					 background: #FFF;
					 --clock-background: rgba(0, 0, 0, 0.05);
         }
				 :host, .backdrop {
					 position: absolute;
					 top: 0;
					 left: 0;
				 }
         :host([show-on-demand]) {
					 opacity: 0;
         }
				 :host([show-on-demand][opened]) {
				 	 opacity: 1;
				 }
				 header {
           display: flex;
           flex-direction: row;
           align-items: center;
           justify-content: center;
					 height: 64px;
					 width: 100%;
					 background: var(--primary-color, #00bcd4);
				 }
				.am-pm, .actions {
					display: flex;
					flex-direction: row;
					height: 64px;
					width: 100%;
				}
				.am-pm {
					margin-bottom: -64px;
					align-items: flex-end;
				}
				.actions {
					align-items: center;
					margin-top: -64px;
					box-sizing: border-box;
					padding: 8px 24px;
				}
				.am, .pm {
					height: 40px;
					width: 40px;
					display: flex;
					align-items: center;
					justify-content: center;
					border-radius: 50%;
					background: var(--clock-background);
					text-transform: uppercase;
				}
				button {
					border: none;
					border-radius: 3px;
					text-transform: uppercase;
					padding: 8px;
					height: 40px;
					min-width: 100px;
					background: transparent;
					cursor: pointer;
					outline: none;
				}
				.flex {
					flex: 1;
				}
				.flex-2 {
					flex: 2;
				}
       </style>
       <header>
         <web-clock picker-clock></web-clock>
       </header>
			 <div class="am-pm">
			 	 <span class="flex"></span>
			 	 <div class="am">am</div>
				 <span class="flex-2"></span>
				 <div class="pm">pm</div>
				 <span class="flex"></span>
			 </div>
       <time-picker-plate></time-picker-plate>
			 <div class="actions">
					<button class="cancel">cancel</button>
					<span class="flex"></span>
					<button class="ok">ok</button>
			 </div>
    `;
    this.plate.addEventListener('update-hour', this._onUpdateHour);
  }

  get digitalClock() {
    return this.root.querySelector('digital-clock');
  }

  get plate() {
    return this.root.querySelector('time-picker-plate')
  }

  get time() {
    return this._time || {hour: '8', minutes: '00'};
  }

  set time(value) {
    this._time = value;
  }

  /**
   * Runs whenever attribute changes are detected
   * @param {string} name The name of the attribute that changed.
   * @param {string|object|array} oldValue
   * @param {string|object|array} newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			this[name] = newValue;
		}
	}

  _onUpdateHour(event) {
    let hour = event.detail;
    let time = this.time;
    time.hour = hour;
    this._notify('time', time);
    this.digitalClock.hour = hour;
  }

  _onUpdateMinutes(event) {
    let minutes = event.detail;
    time.minutes = minutes;
    this._notify('time', time);
    this.digitalClock.hour = minutes;
  }

  _notify(prop, value) {
    this[prop] = value;
  }
}
customElements.define('time-picker', TimePicker$1);
