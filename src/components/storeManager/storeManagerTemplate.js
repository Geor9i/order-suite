import { html } from 'lit-html';
import styles from './storeManager.scss'
import { barButtons } from './constants/storeManagerBarButtons.js';

export const productManagerTemplate = (func) => html`

<div class=${styles['side-bar-backdrop']}></div>
<div class=${styles['side-bar']}>
<div @click=${func.toggleSidebar} title="hide sidebar" id="toggle-bar" class=${`${styles['bar-btn']} ${styles['hide-arrow']}`}>
    <div class=${styles['bar-icon']}>
        <i class="fa-solid fa-caret-left fa-2x"></i>
    </div>
    </div>
   ${barButtons.map(entry => html`
     <div @click=${func.toggleWindow} data-description=${entry.description} data-state="closed" title=${entry.description} class=${styles['bar-btn']}>
        <div class=${styles['bar-icon']}>
            <p>${entry.name}</p>
        </div>
    </div>
        `)}
</div>
<section class=${styles['container']}>

   
</section>
`;

