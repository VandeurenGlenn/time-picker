'use strict';
export default class PubSub {
  /**
   * Creates handlers
   */
  constructor() {
   this.handlers = [];
  }

  /**
   * @param {String} event
   * @param {Method} handler
   * @param {HTMLElement} context
   */
  subscribe(event, handler, context) {
    if (typeof context === 'undefined') {
      context = handler;
    } else {
      context = context.root || context;
    }
    this.handlers.push({event: event, handler: handler.bind(context)});
  }

  /**
   * @param {String} event
   * @param {String|Number|Boolean|Object|Array} value
   */
  publish(event, value) {
    for (let i = 0; i < this.handlers.length; i++) {
      if (this.handlers[i].event === event) {
        this.handlers[i].handler(value);
      }
    }
  }
}
