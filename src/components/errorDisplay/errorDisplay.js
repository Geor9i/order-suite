import { html, render } from "lit-html";
import styles from './errorDisplay.scss';
import { when } from "lit-html/directives/when.js";

export default class ErrorDisplay {
    constructor() {
        this.errors = [];
        this.parent = document.body;
    }

    render() {
        render(html`
            ${when(this.errors.length > 0, () => html`
                <div class=${styles['error-container']}>
                    ${this.errors.map(error => html`
                        <div class=${styles['error']}>
                            <p>${error.message}</p>
                        </div>
                    `)}
                </div>
                <div @click=${this.close.bind(this)} class=${styles['error-backdrop']}></div>
                `, () => html``)}
                `, this.parent);
    }

    close() {
        this.clear();
        this.render();
    }

    push(...errors) {
        this.errors.push(...errors);
    }

    clear() {
        this.errors = [];
    }
}