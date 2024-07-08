import { render } from "lit-html";
import { programBaseTemplate } from './programBaseTemplate.js';

export default class Program {
    constructor() {
        this.template = programBaseTemplate;
        this.subscriptions = {};
        this.windowContentElement = null;
    }

    boot() {
        render(this.template(), this.windowContentElement);
    }


    close() {
        for (let group in this.subscriptions) {
            this.subscriptions[group].forEach(unsubscribe => unsubscribe());
        }
    }

}