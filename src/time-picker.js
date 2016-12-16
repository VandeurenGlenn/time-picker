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
    return [];
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
           height: 48px;
           width: 80px;
					 box-shadow: 0 14px 45px rgba(0, 0, 0, 0.25),
					 						 0 10px 18px rgba(0, 0, 0, 0.22);
					 background: #FFF;
           --time-picker-plate-size: 200px;
           --time-picker-plate-padding: 22px 0 20px 0;
           transition: transform ease-out 160ms, opacity ease-out 160ms, scale ease-out 160ms;
           transform-origin: top left;
					 position: absolute;
					 top: 0;
					 left: 0;
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
         :host([show-on-demand]) {
					 opacity: 0;
         }
				 :host([show-on-demand][opened]) {
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
           padding: 8px;
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
        :host(.picker-opened[minutes-picker]) time-picker-minutes-plate,
        :host(.picker-opened[hour-picker]) time-picker-hour-plate {
          opacity: 1;
          display: flex;
        }
        :host(.picker-opened[hour-picker]) time-picker-hour-plate,
        :host(.picker-opened[minutes-picker]) time-picker-minutes-plate {
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
    this.time = {
      hour: '08',
      minutes: '00'
    }
    this.timeFormat = 24;
    this.hourPicker = true;
    this.webClock.addEventListener('click', this._onWebClockClick);
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

  set opened(value) {
    this._opened = value;
  }

  get opened() {
    return this._opened;
  }

  set hourPicker(value) {
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

  set time(value) {
    this._time = value;
    this.webClock.hour = value.hour;
    this.webClock.minutes = value.minutes;
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
			this[name] = newValue;
		}
	}

  _onHourClick() {
    this.hourPicker = true;
  }

  _onMinutesClick() {
    this.hourPicker = false;
  }

  _onUpdateHour(event) {
    let hour = event.detail;
    let time = this.time;
    // place a 0 before the digit when length is shorter than 2
    hour = this._transformToTime(hour);
    time.hour = hour;
    this._notify('time', time);
  }

  _onUpdateMinutes(event) {
    let minutes = event.detail;
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
    this.opened = !this.opened;
    this.flip(this.opened);
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
      requestAnimationFrame(() => {
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
}
customElements.define('time-picker', TimePicker);
