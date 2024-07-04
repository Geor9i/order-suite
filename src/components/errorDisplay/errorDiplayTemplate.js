import { html } from "lit-html";
import styles from './errorDisplay.scss';

export const errorDisplayTemplate = (errors, controls) => html`
<div class=${styles['error-container']}>
    ${console.log(errors)}
    ${errors.forEach(error => console.log(error.message))}
    ${errors.forEach(error => html`
        <h2>Hello</h2>
        <div class=${styles['error']}>
            <p>${error.message}</p>
        </div>
    `)}
</div>
   <div @click=${controls.close} class=${styles['error-backdrop']}></div>
`