import { html } from "lit-html";
import styles from './nav.module.scss'

export const userNavTemplate = (dropDown, logoutHandler, STORE_NAME) => html`
        <div class=${styles['main__title']} @click=${dropDown}>Inflow</div>
        <div id="dropdown__menu" class=${styles['dropdown__menu']}>
            <div class=${styles['dropdown__menu-account-container']}>
            <a @click=${(e) => {dropDown(e)}} href="/" class=${`${styles['menu__selector']} ${styles['menu__selector__account']}`}>
                    <p>Home</p>
                </a>
            <a @click=${dropDown} href="/" class=${`${styles['menu__selector']} ${styles['menu__selector__account']}`}>
                    <p>${ STORE_NAME }</p>
                </a>
                <a @click=${(e) => {dropDown(e); logoutHandler(e)}} class=${`${styles['menu__selector']} ${styles['menu__selector__account']}`}>
                    <p>Logout</p>
                </a>
            </div>
            <div class=${styles['dropdown__menu-content-container']}>
                <a @click=${dropDown} href="/order-form" class=${styles['menu__selector']}>
                    <p>Place Order</p>
                </a>
                <a @click=${dropDown} href="/restaurant" class=${styles['menu__selector']}>
                    <p>My</p>
                    <p>Restaurant</p>
                </a>
            </div>
            <div @click=${dropDown} class=${styles['menu__pulldown']}></div>
        </div>
        <div class=${styles['menu-backdrop']} @click=${dropDown}></div>
`;