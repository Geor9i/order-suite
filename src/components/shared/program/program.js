import { render } from "lit-html";
import { programBaseTemplate } from './programBaseTemplate.js';

export default class Program {
    constructor() {
        this.template = programBaseTemplate;
        this.subscriptions = {};
        this.contentElement = null;
    }

    boot() {
        render(this.template(), this.contentElement);
    }


    close() {
        for (let group in this.subscriptions) {
            this.subscriptions[group].forEach(unsubscribe => unsubscribe());
        }
    }

}