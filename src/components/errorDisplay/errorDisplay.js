import { render } from "lit-html";
import { errorDisplayTemplate } from "./errorDiplayTemplate.js";
import styles from './errorDisplay.scss';

export default class ErrorDisplay {
    constructor() {
        this.errors = [];
        this.parent = document.body;
        this.container = null;
    }

    render() {
        const controls = {
            close: this.close.bind(this)
        }
        render(errorDisplayTemplate(this.errors, controls), this.parent);
        this.container = this.parent.querySelector(`.${styles['error-container']}`);
        this.backdrop = this.parent.querySelector(`.${styles['error-backdrop']}`);
    }

    close() {
        if (!this.container) return;
        this.container.remove();
        this.backdrop.remove();
        this.container = null;
        this.backdrop = null;
    }

    push(...errors) {
        this.errors.push(...errors);
    }

    clear() {
        this.errors = [];
    }
}