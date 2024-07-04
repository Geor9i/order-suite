import { html } from "lit-html";
import styles from './errorDisplay.scss';
import { when } from "lit-html/directives/when.js";

export const errorDisplayTemplate = (errors, controls) => html`
<div class=${styles['error-container']}>
    ${errors.map(error => html`
        <div class=${styles['error']}>
            <p>${error.message}</p>
        </div>
    `)}
</div>
   <div @click=${controls.close} class=${styles['error-backdrop']}></div>
`