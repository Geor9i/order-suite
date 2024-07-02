import { html } from "lit-html";
import styles from './window.scss';

export const windowTemplate = (title = '', controls) => html`
${console.log(controls.state)}
    <header>
        <p>${title}</p>
        <div class=${styles['controls']}>
            <div @click=${controls.minimize} class=${`${styles['control-btn']} ${styles['minimize']}`}>
                <i class="fa-solid fa-window-minimize"></i>
            </div>
            <div @click=${controls.maximize} class=${`${styles['control-btn']} ${styles['maximize']}`}>
                <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
            
            </div>
            <div @click=${controls.close} class=${`${styles['control-btn']} ${styles['close']}`}>
                <i class="fa-solid fa-xmark"></i>
            </div>
        </div>
    </header>
    <div data-id="top" class=${`${styles['edge']} ${styles['top']} ${styles['draggable']}`}></div>
    <div data-id="right" class=${`${styles['edge']} ${styles['right']} ${styles['draggable']}`}></div>
    <div data-id="bottom" class=${`${styles['edge']} ${styles['bottom']} ${styles['draggable']}`}></div>
    <div data-id="left" class=${`${styles['edge']} ${styles['left']} ${styles['draggable']}`}></div>
    <div data-id="top-left" class=${`${styles['vertex']} ${styles['top-left']} ${styles['draggable']}`}></div>
    <div data-id="top-right" class=${`${styles['vertex']} ${styles['top-right']} ${styles['draggable']}`}></div>
    <div data-id="bottom-left" class=${`${styles['vertex']} ${styles['bottom-left']} ${styles['draggable']}`}></div>
    <div data-id="bottom-right" class=${`${styles['vertex']} ${styles['bottom-right']} ${styles['draggable']}`}></div>
    <div class=${styles['content']}>
        
    </div>

`