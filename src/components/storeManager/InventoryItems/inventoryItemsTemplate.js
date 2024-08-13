import { html } from "lit-html";
import styles from './inventoryItems.scss';

export const inventoryItemsTemplate = (inventoryItems, controls) => html`
<div class=${styles['container']}>
    <section class=${styles['category-container']}>
    <ul>
     ${Object.keys(inventoryItems).map(groupName => html`
        <li @click=${() => controls.toggleGroup(groupName)}>${groupName}</li>
        `)}
    </ul>
    </section>
    <section class=${styles['product-container']}>
      
    </section>
</div>
`