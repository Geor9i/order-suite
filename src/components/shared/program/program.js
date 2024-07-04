import { render } from "lit-html";
import { programBaseTemplate } from './programBaseTemplate.js';

export default class Program {
    constructor(programConfig) {
        this.template = programBaseTemplate;
        this.subscriptions = {};
        this.programConfig = programConfig;
    }

    boot(windowContentElement) {
        render(this.template(), windowContentElement);
    }


    close() {
        for (let group in this.subscriptions) {
            this.subscriptions[group].forEach(unsubscribe => unsubscribe());
        }
    }
}