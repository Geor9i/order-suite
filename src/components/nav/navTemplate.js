import { html } from "../../../node_modules/lit-html/lit-html.js";


export const navTemplate = (dropDown) => html`
<section id="top__section">
            <div class="main__title" @click=${dropDown} >NEXT ORDER</div>
        </section>
        <div id="dropdown__menu" class="dropdown__menu">
            <div class="dropdown__menu-content-container">
                <a @click=${dropDown} href="/account" class="menu__selector menu__selector__account">
                    <p>Farnborough</p>
                </a>
                <a @click=${dropDown} href="/order-form" class="menu__selector menu__selector_left">
                    <p>Place Order</p>
                </a>
                <a @click=${dropDown} href="/restaurant" class="menu__selector menu__selector_right">
                    <p>My</p>
                    <p>Restaurant</p>
                </a>
            </div>
            <div @click=${dropDown} class="menu__pulldown"></div>
        </div>
        <div class="menu-backdrop" @click=${dropDown}></div>
`;