'use strict';
export default class CustomHTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this._setupEventAttributes();
  }
  fire(eventName, data, target=this) {
    target.dispatchEvent(new CustomEvent(eventName, {detail: data}));
  }

  /**
   * example on-tap="onTap"
   */
  _checkForEventAttributes() {
    let attribute = this.attributes;
    for (let attribute of attributes) {
      if (attribute.includes('on-')) {
        console.log(attribute);
        let eventName = attribute.split('on-')[1];
        console.log(eventName);
        let event = this.getAttribute(attribute);
        console.log(event);
        let parent = this.parentNode || this.parentElement;
        parent.addEventListener(eventName, event.bind(parent));
      }
    }
  }
}
