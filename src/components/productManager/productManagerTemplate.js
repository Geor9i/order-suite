import { html } from 'lit-html';
import styles from './productManager.module.scss'
import { barButtons } from '../../constants/productManagerBarButtons.js';

export const productManagerTemplate = (func) => html`

<div class=${styles['side-bar-backdrop']}></div>
<div class=${styles['side-bar']}>
<div @click=${func.toggleSidebar} title="hide sidebar" id="toggle-bar" class=${`${styles['bar-btn']} ${styles['hide-arrow']}`}>
    <div class=${styles['bar-icon']}>
        <i class="fa-solid fa-caret-left fa-2x"></i>
    </div>
    </div>
   ${barButtons.map(entry => html`
     <div @click=${func.toggleWindow} data-name=${entry.description} data-state="closed" title=${entry.description} class=${styles['bar-btn']}>
        <div class=${styles['bar-icon']}>
            <p>${entry.name}</p>
        </div>
    </div>
        `)}
</div>
<section class=${styles['container']}>

   
</section>
`;

