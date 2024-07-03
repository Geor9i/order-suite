import { html } from "lit-html";
import styles from './inventoryItems.scss';

export const inventoryItemsTemplate = () => html`
<div class=${styles['container']}>
    <section class=${styles['category-container']}></section>
    <section class=${styles['product-container']}></section>
</div>
`