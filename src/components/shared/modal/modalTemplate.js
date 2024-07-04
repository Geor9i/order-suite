import { html } from "lit-html";
import styles from './modal.scss';

export const modalTemplate = (title = '', message = '', controls, options) => html`
    <header class=${styles['modal-header']}>
        <p>${title}</p>
        <div class=${styles['controls']}>

            ${!options?.noClose ? html `
                 <div @click=${controls.close} class=${`${styles['control-btn']} ${styles['close']}`}>
                    <i class="fa-solid fa-xmark"></i>
                </div>
                    ` : null}
           
        </div>
    </header>
    <div class=${styles['content']}>
        <p class=${styles['message']}>${message}</p>
        <div class=${styles['btn-container']}>
            ${options?.buttons.map(buttonObj => html`
                <a @click=${() => controls.confirm(buttonObj)} class=${styles['modal-btn']}>${buttonObj.title}</a>`
            )}
        </div>
    </div>

`