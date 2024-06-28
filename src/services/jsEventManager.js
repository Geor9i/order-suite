import { eventTypes } from "../config/events.js";

export class JSEventManagerService {
    constructor(jsEventBus) {
        this.jsEventBus = jsEventBus;
        this.eventTypes = eventTypes;
        this.hasInitilized = false;
        this.defaultHost = document.querySelector('.wrapper');
        this.maxParentCounter = 50;
        this._init();
    }
  
    _init() {
      if (this.hasInitilized) throw new Error('Events already Initialized!');
      this.hasInitilized = true;
      this.eventTypes.forEach((event) => {
        let { type, eventHost } = event;
        eventHost = eventHost ? eventHost : this.defaultHost;
        if (eventHost) {
          const eventRef = eventHost.addEventListener(type, (e) => {
            const { parents, children } = this.getRelatives(e);
            this.jsEventBus.publish({ e, parents, children });
          });
        }
      });
    }
  
    getRelatives(e) {
      let currentElement = e.target;
      const parents = [];
      if (e.target) {
        const target = e.target;
        const children = target.children ? Array.from(target.children) : [];
        let counter = this.maxParentCounter;
        while (currentElement && currentElement.parentElement && counter > 0) {
          currentElement = currentElement.parentElement;
          parents.push(currentElement);
          counter--;
          if (currentElement === e.currentTarget) {
            break;
          }
        }
        return { parents, children };
      }
      return { parents: [], children: [] };
    }
  }