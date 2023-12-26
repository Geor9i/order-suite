import { html } from "lit-html";
import styles from './nav.module.css'

export const userNavTemplate = (dropDown, logoutHandler) => html`
<section id="top__section">
            <div class=${styles['main__title']} @click=${dropDown}>Inflow</div>
        </section>
        <div id="dropdown__menu" class=${styles['dropdown__menu']}>
            <div class=${styles['dropdown__menu-account-container']}>
            <a @click=${(e) => {dropDown(e); logoutHandler(e)}} class=${`${styles['menu__selector']} ${styles['selector-logout']}`}>
                    <p>Logout</p>
                </a>
            <a @click=${dropDown} href="/account" class=${`${styles['menu__selector']} ${styles['menu__selector__account']}`}>
                    <p>Farnborough KFC</p>
                    <p>Account</p>
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