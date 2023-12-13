import { html } from "../../../node_modules/lit-html/lit-html.js";

let tableData = (headerData, products) => html`
  <div class="order__table__page-output-order-header">
    ${html` <table class="data-table-header">
      <tr class="product-table-header-row">
        <th class="data-table-header__product-th">Product</th>
        <th class="data-table-header__order-th">Order</th>
        <th class="data-table-header__weekly-usage-th">Weekly Usage</th>
        <th class="data-table-header__price-th">Price</th>
        <th class="data-table-header__in-stock-th">In Stock</th>
        <th class="data-table-header__stock-on-1-th">
          ${headerData.invoiceDay}
        </th>
        <th class="data-table-header__stock-on-2-th">
          ${headerData.nextInvoiceDay}
        </th>
        <th class="data-table-header__keep-th">Keep</th>
      </tr>
    </table>`}
  </div>
  <div class="order__table__page-output-order">
    <table class="data-table">
      <tbody class="product-table-tbody">
        ${Object.keys(products).map((product) => {
          let current = products[product];
          if (current.order) {
            return html` <tr class="product-table-tr" id="${current.id}">
              <td class="product-name-td">${product}</td>
              <td class="order-quantity-td">
                <h3 class="order-quantity-value">${current.order}</h3>
                <div class="value-button__container">
                  <button class="value-button">-</button>
                  <button class="value-button">+</button>
                </div>
              </td>
              <td class="product-usage-td">${current.weeklyUsage}</td>
              <td class="product-price-td">${current.price}</td>
              <td class="product-onhand-td">${current.onHand}</td>
              <td class="order-day-onhand-td">${current.stockOnOrderDay}</td>
              <td class="post-delivery-quantity-td">
                ${current.nextOrderDayOnHand}
              </td>
              <td class="keep-checkbox-td">
                <input class="order__checkbox" type="checkbox" checked="true" />
              </td>
            </tr>`;
          }
        })}
      </tbody>
    </table>
  </div>
  <div class="order__table__page-side-selector__screen">
    <table id="side-table__search">
      ${Object.keys(products).map((product) => {
        let current = products[product];
        if (!current.order) {
          return html`
            <tr class="side-table-row hidden">
              <td class="side-product-td">CHICKEN ORIGINAL</td>
              <td class="side-value-td">
                <h3 class="side-input-value-td">0</h3>
                <div class="side-menu__value-button__container">
                  <button class="side-menu-value-button">+</button>
                  <button class="side-menu-value-button">-</button>
                </div>
              </td>
            </tr>
          `;
        }
      })}
    </table>
  </div>
`;

let dataTable = (products) => html` <table class="data-table">
  <tbody class="product-table-tbody"></tbody>
</table>`;

let sideTable = (products) => html` <table id="side-table__search">
  ${products}
  <tr class="side-table-row hidden">
    <td class="side-product-td">CHICKEN ORIGINAL</td>
    <td class="side-value-td">
      <h3 class="side-input-value-td">0</h3>
      <div class="side-menu__value-button__container">
        <button class="side-menu-value-button">+</button>
        <button class="side-menu-value-button">-</button>
      </div>
    </td>
  </tr>
</table>`;

export const orderPageTemplate = (headerData, products) =>
  html`<div class="generated__order-page__main__container">
    <h1 class="generated__order-page__main__title"></h1>
    <div class="output__option-bar">
      <button
        id="output__option-bar__print__button"
        class="output__option-bar__button"
      >
        Print Order
      </button>
      <button
        id="output__option-bar__update__button"
        class="output__option-bar__button"
      >
        Update
      </button>
      <button
        id="output__option-bar__copy__button"
        class="output__option-bar__button"
      >
        Copy Script
      </button>
      <input type="text" id="output__option-bar__search-field" />
      <button
        id="output__option-bar__add__button"
        class="output__option-bar__button"
      >
        Add
      </button>
    </div>
    <div class="order__table__page__container">${tableData(headerData, products)}</div>
  </div>`;
