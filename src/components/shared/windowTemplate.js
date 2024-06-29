import { html } from "lit-html";
import styles from './window.scss';

export const windowTemplate = () => html`

<div class=${styles['window']}>
    <header>
        <p>Inventory</p>
    </header>
    <div class=${`${styles['edge']} ${styles['top']}`}></div>
    <div class=${`${styles['edge']} ${styles['right']}`}></div>
    <div class=${`${styles['edge']} ${styles['bottom']}`}></div>
    <div class=${`${styles['edge']} ${styles['left']}`}></div>
    <div class=${`${styles['vertex']} ${styles['top-left']}`}></div>
    <div class=${`${styles['vertex']} ${styles['top-right']}`}></div>
    <div class=${`${styles['vertex']} ${styles['bottom-left']}`}></div>
    <div class=${`${styles['vertex']} ${styles['bottom-right']}`}></div>

</div>
`