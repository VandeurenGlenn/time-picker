'use strict';
import TimePickerPlate from './time-picker-plate.js';
import PubSub from './internals/pub-sub.js';
'@web-clock-lite';
let pubsub = new PubSub();
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
         <web-clock-lite picker-clock></web-clock-lite>
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
customElements.define('time-picker', TimePicker);
