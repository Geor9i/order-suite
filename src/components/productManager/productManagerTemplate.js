import { html } from 'lit-html';
import styles from './productManager.module.scss'


export const productManagerTemplate = () => html`

<section class=${styles['container']}>
    <div class=${styles['product-manager-container']}>

    <div draggable="true" class=${`${styles['system-product-manager']} ${styles['draggable']}`}>
        <header>
            <p>Inventory</p>
        </header>

    </div>

    </div>
</section>
`;