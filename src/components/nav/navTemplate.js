import { html } from "../../../node_modules/lit-html/lit-html.js";


export const navTemplate = (dropDown) => html`
<section id="top__section">
            <div class="main__title" @click=${dropDown} >NEXT ORDER</div>
        </section>
        <div class="dropdown__menu">
            <div class="menu__container">
                <a @click=${dropDown} href="/order-form" class="menu__selector menu__make__order">
                    <h1>Place Order</h1>
                </a>
                <a @click=${dropDown} class="menu__selector menu__adjust__products">
                    <h1>Store Template</h1>
                </a>
                <div class="menu__pulldown"></div>
            </div>
        </div>
`;