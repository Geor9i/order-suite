import { html } from "lit-html";
import styles from './modal.scss';

export const modalTemplate = (title = '', controls, options) => html`
    <header>
        <p>${title}</p>
        <div class=${styles['controls']}>
            <div @click=${controls.close} class=${`${styles['control-btn']} ${styles['close']}`}>
                <i class="fa-solid fa-xmark"></i>
            </div>
        </div>
    </header>
    <div class=${styles['content']}>
        ${options?.buttons.map(buttonObj => html`
            <a @click=${() => controls.confirm(buttonObj)} class=${styles['modal-btn']}>${buttonObj.title}</a>`
        )}
    </div>

`