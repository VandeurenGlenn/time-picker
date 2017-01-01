'use strict';
import TimePickerHourPlate from './time-picker-hour-plate.js';
import TimePickerMinutesPlate from './time-picker-minutes-plate.js';
import PubSub from './internals/pub-sub.js';
import WebClockLite from './../bower_components/web-clock-lite/src/web-clock-lite.js';

let pubsub = new PubSub();
// TODO: Cleanup & add settings menu
/**
 * @extends HTMLElement
 */
class TimePicker extends HTMLElement {
  /**
   * Attributes to observer
   * @return {Array} []
   */
  static get observedAttributes() {
    return ['no-clock', 'hour', 'minutes'];
  }

  /**
   * Calls super
   */
  constructor() {
   super();
   this.root = this.attachShadow({mode: 'open'});
   this._onUpdateHour = this._onUpdateHour.bind(this);
   this._onUpdateMinutes = this._onUpdateMinutes.bind(this);
   this._onWebClockClick = this._onWebClockClick.bind(this);
   this._onHourClick = this._onHourClick.bind(this);
   this._onMinutesClick = this._onMinutesClick.bind(this);
   this._onOk = this._onOk.bind(this);
   this._onCancel = this._onCancel.bind(this);
  }

  /**
   * Stamps innerHTML
   */
  connectedCallback() {
    this.root.innerHTML = `
       <style>
         :host {
           display: flex;
           align-items: center;
           justify-content: center;
           height: 40px;
           width: 80px;
					 box-shadow: 0 14px 45px rgba(0, 0, 0, 0.25),
					 						 0 10px 18px rgba(0, 0, 0, 0.22);
					 background: #FFF;
           --time-picker-plate-size: 200px;
           --time-picker-plate-padding: 22px 0 20px 0;
           transition: transform ease-out 160ms, opacity ease-out 160ms, scale ease-out 160ms;
           transform-origin: top left;
           will-change: transform, height, width, opacity;
           --primary-color: #00bcd4;
           --primary-text-color: #555;
           --clock-container-background: var(--primary-color);
         }
				 .backdrop {
					 position: absolute;
					 top: 0;
					 left: 0;
				 }
         .am-pm, .actions, time-picker-hour-plate, time-picker-minutes-plate {
           width: 0;
           height: 0;
           opacity: 0;
           margin: 0;
           padding: 0;
           pointer-events: none;
         }
         time-picker-hour-plate, time-picker-minutes-plate {
           display: none;
         }
         :host([show-on-demand]), :host([show-on-demand]) .clock-container {
					 opacity: 0;
           height: 0;
           width: 0;
         }
         :host(.no-clock) {
           opacity: 0;
           pointer-events: none;
           width: 0;
           height: 0;
         }
				 :host([show-on-demand] .picker-opened) :host(.picker-opened) {
				 	 opacity: 1;
				 }
         :host(.picker-opened) .clock-container {
           display: flex;
           flex-direction: row;
           align-items: center;
           justify-content: center;
					 height: 64px;
					 width: 100%;
					 background: var(--clock-container-background);
           color: var(--clock-container-color);
           transition: background ease-in 300ms;
         }
				 .clock-container {
           box-sizing: border-box;
				 }
				.am-pm, .actions {
					display: flex;
					flex-direction: row;
				}
				.am-pm {
					align-items: flex-end;
          box-sizing: border-box;
				}
				.actions {
					align-items: center;
					box-sizing: border-box;
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
        :host(.picker-opened) {
          opacity: 1;
          display: flex;
          flex-direction: column;
          width: 100%;
          height: auto;
          max-width: 320px;
          box-shadow: 0 14px 45px rgba(0, 0, 0, 0.25),
          						 0 10px 18px rgba(0, 0, 0, 0.22);
          background: #FFF;
          --clock-background: rgba(0, 0, 0, 0.05);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: transform ease-in 300ms, opacity ease-in 300ms, scale ease-in 300ms;
        }
        :host(.picker-opened) .am-pm, :host(.picker-opened) .actions {
					height: 64px;
					width: 100%;
					padding: 8px 24px;
          pointer-events: auto;
        }
        :host(.picker-opened) .am-pm, :host(.picker-opened) .actions {
          opacity: 1;
        }
        :host(.picker-opened[hour-picker]) time-picker-hour-plate,
        :host(.picker-opened[minutes-picker]) time-picker-minutes-plate {
          opacity: 1;
          display: flex;
          margin: auto;
          width: var(--time-picker-plate-size);
          height: var(--time-picker-plate-size);
          padding: var(--time-picker-plate-padding);
          pointer-events: auto;
        }
       </style>
       <span class="clock-container">
         <web-clock-lite style="cursor: pointer;"></web-clock-lite>
       </span>
			 <div class="am-pm">
			 	 <span class="flex"></span>
			 	 <div class="am">am</div>
				 <span class="flex-2"></span>
				 <div class="pm">pm</div>
				 <span class="flex"></span>
			 </div>
       <time-picker-hour-plate></time-picker-hour-plate>
       <time-picker-minutes-plate></time-picker-minutes-plate>
			 <div class="actions">
        <button class="cancel">cancel</button>
        <span class="flex"></span>
        <button class="ok">ok</button>
			 </div>
    `;
    if (this.noClock === false) {
      this.webClock.addEventListener('click', this._onWebClockClick);
    }
    this.timeFormat = this.timeFormat;
    this.hourPicker = true;
  }

  get webClock() {
    return this.root.querySelector('web-clock-lite');
  }

  get plate() {
    return this.root.querySelector('time-picker-hour-plate');
  }

  get minutesPlate() {
    return this.root.querySelector('time-picker-minutes-plate');
  }

  get animations() {
    return {
      entry: {
        opacity: 1,
        transform: 'translateY(-50%) translateX(-50%) scale(1)'
      },
      out: {
        opacity: 1,
        transform: 'translateY(0) translateX(0) scale(1)'
      },
      shared: {
        translate: (x, y) => {
          return {opacity: '0.1', transform: `translateY(${y}px) translateX(${x}px) scale(0.1)`};
        }
      }
    }
  }

  get time() {
    return this._time || {hour: '8', minutes: '00'};
  }

  get cancelButton() {
    return this.root.querySelector('.cancel');
  }

  get okButton() {
    return this.root.querySelector('.ok');
  }

  get timeFormat() {
    return this._timeFormat || 24;
  }

  get noClock() {
    return this._noClock || false;
  }

  set opened(value) {
    this._opened = value;
  }

  get opened() {
    return this._opened;
  }

  set noClock(value) {
    this._noClock = value;
    if (value) {
      this.classList.add('no-clock');
    } else {
      this.classList.remove('no-clock');
    }
  }

  set hourPicker(value) {
    this._timeFormat = value;
    let plate = this.root.querySelector('time-picker-hour-plate');
    let minutesPlate = this.root.querySelector('time-picker-minutes-plate');
    if (value) {
      plate.addEventListener('update-hour', this._onUpdateHour);
      minutesPlate.removeEventListener('update-minutes', this._onUpdateMinutes);
      this.removeAttribute('minutes-picker');
      this.setAttribute('hour-picker', '');
    } else {
      plate.removeEventListener('update-hour', this._onUpdateHour);
      minutesPlate.addEventListener('update-minutes', this._onUpdateMinutes);
      this.removeAttribute('hour-picker');
      this.setAttribute('minutes-picker', '');
    }
  }

  set hour(value) {
    this._onUpdateHour(value);
  }

  set minutes(value) {
    this._onUpdateMinutes(value);
  }

  set time(value) {
    this._time = value;
    if (!this.webClockLiteReady) {
      customElements.whenDefined('web-clock-lite').then(() => {
        this._updateTime(value.hour, value.minutes);
        this.webClockLiteReady = true;
      });
      return;
    }
    this._updateTime(value.hour, value.minutes);
  }

  _updateTime(hour, minutes) {
    this.webClock.hour = hour;
    this.webClock.minutes = minutes;
    this.dispatchEvent(new CustomEvent('time-change', {detail: this.time}));
  }

  set timeFormat(value) {
    let amPm = this.root.querySelector('.am-pm');
    if (value !== 'am' && value !== 'pm') {
      amPm.style.opacity = 0;
      amPm.style.height = 0;
      amPm.style.pointerEvents = 'none';
    } else {
      amPm.style.opacity = 1;
      amPm.style.height = 'initial';
      amPm.style.pointerEvents = 'auto';
    }
    this.plate.timeFormat = value;
  }

  /**
   * Runs whenever attribute changes are detected
   * @param {string} name The name of the attribute that changed.
   * @param {string|object|array} oldValue
   * @param {string|object|array} newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			this[this._toJsProp(name)] = newValue;
		}
	}

  _onHourClick() {
    this.hourPicker = true;
  }

  _onMinutesClick() {
    this.hourPicker = false;
  }

  _onUpdateHour(event) {
    let hour = event.detail || event;
    let time = this.time;
    // place a 0 before the digit when length is shorter than 2
    hour = this._transformToTime(hour);
    time.hour = hour;
    this._notify('time', time);
  }

  _onUpdateMinutes(event) {
    let minutes = event.detail || event;
    let time = this.time;
    minutes = this._transformToTime(minutes);
    time.minutes = minutes;
    this._notify('time', time);
  }

  _transformToTime(number) {
    // place a 0 before the digit when needed
    if (String(number).length === 1) {
      return number = `0${number}`;
    }
    return number;
  }

  _notify(prop, value) {
    this[prop] = value;
  }

  _onWebClockClick(event) {
    event.preventDefault();
    if (this.opened) {
      return;
    }
    this.open();
  }

  open() {
    this.opened = true;
    this.flip(true);
  }

  flip(opened) {
    let animations;
    // Get the first position.
    var first = this.getBoundingClientRect();
    let hourEl = this.webClock.root.querySelector('.hour');
    let minutesEl = this.webClock.root.querySelector('.minutes');
    // Get the last position.
    if (opened) {
      hourEl.addEventListener('click', this._onHourClick);
      minutesEl.addEventListener('click', this._onMinutesClick);
      this.removeEventListener('click', this._onWebClockClick);
      this.okButton.addEventListener('click', this._onOk);
      this.cancelButton.addEventListener('click', this._onCancel);
      this.classList.add('picker-opened');
    } else {
      hourEl.removeEventListener('click', this._onHourClick);
      minutesEl.removeEventListener('click', this._onMinutesClick);
      this.addEventListener('click', this._onWebClockClick);
      this.okButton.removeEventListener('click', this._onOk);
      this.cancelButton.removeEventListener('click', this._onCancel);
      this.classList.remove('picker-opened');
    }
    var last = this.getBoundingClientRect();

    // Invert.
    let top = first.top - last.top;
    let left = first.left - last.left;
    if (opened) {
      let color = this.style.getPropertyValue('--primary-color');
      animations = [
        this.animations.shared.translate(left, top), this.animations.entry
      ]
      requestAnimationFrame(() => {
        this.style.setProperty('--clock-container-background', '#FFF');
      });
      requestAnimationFrame(() => {
        this.style.setProperty('--clock-container-background', color);
      });
      this.style.setProperty('--web-clock-color', '#FFF');
    } else {
      let textColor = this.style.getPropertyValue('--primary-text-color');
      animations = [
        this.animations.shared.translate(left, top), this.animations.out
      ]
      this.style.setProperty('--web-clock-color', textColor);
    }
    // Go from the inverted position to last.
    var player = this.animate(animations, {
      duration: 300,
      easing: 'cubic-bezier(0,0,0.32,1)',
    });
    // Do any tidy up at the end
    // of the animation.
    player.addEventListener('finish', () => {
      // Workaround for blurry hours bug.
      if (opened) requestAnimationFrame(() => {
        this.style.display = 'block';
        this.plate.style.display = 'block';
        this.minutesPlate.style.display = 'block';
      });
      else requestAnimationFrame(() => {
        this.style.display = 'flex';
        this.plate.style.display = 'block';
        this.minutesPlate.style.display = 'block';
      });
    });
  }

  _onOk(event) {
    event.stopPropagation();
    event.preventDefault();
    this.opened = false;
    this.flip(false);
    this.dispatchEvent(
      new CustomEvent('time-picker-select', {detail: this.time}));
  }

  _onCancel(event) {
    event.stopPropagation();
    event.preventDefault();
    this.opened = false;
    this.flip(false);
  }

  _toJsProp(string) {
    var parts = string.split('-');
    if (parts.length > 1) {
      var upper = parts[1].charAt(0).toUpperCase();
      string =  parts[0] + upper + parts[1].slice(1).toLowerCase();
    }
    return string;
  }
}
customElements.define('time-picker', TimePicker);
