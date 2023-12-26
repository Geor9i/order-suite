import { html } from "lit-html"
import styles from './restaurantMenu.module.css'
export const restaurantMenuTemplate = (menuButtonhandler) => html`

<div class=${styles['restaurant-menu']}>
<div @click=${menuButtonhandler} id="restaurantTemplate" class=${styles['restaurant-selector-btn']}>
    <p>Restaurant</p>
    <p>Template</p>
</div>
<div @click=${menuButtonhandler} id="products" class=${styles['restaurant-selector-btn']}>
    <p>Product</p>
    <p>Manager</p>
</div>
<div @click=${menuButtonhandler} id="sales" class=${styles['restaurant-selector-btn']}>
    <p>Sales</p>
    <p>Analysis</p>
</div>

</div>
`
