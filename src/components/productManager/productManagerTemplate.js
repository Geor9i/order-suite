import { html } from 'lit-html';
import styles from './productManager.module.scss'


export const productManagerTemplate = () => html`

<section class=${styles['container']}>
    <div class=${styles['product-manager-container']}>

    <div class=${styles['system-product-manager']}>
        <header>Inventory</header>

    </div>

    </div>
</section>
`;