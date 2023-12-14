import { html } from "../../../node_modules/lit-html/lit-html.js";

let tableData = (headerData, products, valueButtonClick, deleteHandler) => html`
  <div class="order__table__page-output-order-header">
    ${html` <div class="data-table-header">
      <div class="data-table-th"><p>Product</p></div>
      <div class="data-table-th"><p>Order</p></div>
      <div class="data-table-th">
        <p>Weekly</p>
        <p>Usage</p>
      </div>
      <div class="data-table-th"><p>Price</p></div>
      <div class="data-table-th">
        <p>Current</p>
        <p>Stock</p>
      </div>
      <div class="data-table-th">
        <p>Stock on</p>
        <p>${headerData.invoiceDay.weekday}</p>
        <p>${headerData.invoiceDay.date}</p>
      </div>
      <div class="data-table-th">
        <p>Stock on</p>
        <p>${headerData.nextInvoiceDay.weekday}</p>
        <p>${headerData.nextInvoiceDay.date}</p>
      </div>
      <div class="data-table-th"></div>
    </div>`}
  </div>
  <div class="order__table__page-output-order">
    <div class="data-table">
      ${Object.keys(products).map((productId) => {
        let current = products[productId];
        if (current.order) {
          return html` <div class="product-table-tr" id="${current.id}">
            <div class="td">${current.product}</div>
            <div class="td order-value-td">
              <button data-id="${productId}" @click=${valueButtonClick} id="main-minus" class="value-button">-</button>
              <p>${current.order}</p>
              <button data-id="${productId}" @click=${valueButtonClick} id="main-plus" class="value-button">+</button>
            </div>
            <div class="td">${current.weeklyUsage}</div>
            <div class="td">${current.price}</div>
            <div class="td">${current.onHand}</div>
            <div class="td">${current.stockOnOrderDay}</div>
            <div class="td">${current.nextOrderDayOnHand}</div>
            <div class="td">
              <button data-id="${productId}" @click=${deleteHandler} class="product-delete-btn">Delete</button>
            </div>
          </div>`;
        }
      })}
    </div>
  </div>
`;

let sideTable = (products, valueButtonClick) => html`
  <div class="order__table__page-side-selector__screen">
    <div id="side-table__search">
      ${Object.keys(products).map((productId) => {
        let current = products[productId];
        const show = current.order === 0 && current.sideDisplay === true;
        return html`
          <div id="${productId}" class="side-table-tr ${!show? "hidden" : ""}">
            <p class="td">${current.product}</p>
              <button data-id="${productId}" @click=${valueButtonClick} id="side-plus" class="side-value-button">+</button>
          </div>
        `;
      })}
    </div>
  </div>
`;

export const orderPageTemplate = (headerData, products, searchHandler, valueButtonClick, deleteHandler, resetHandler, copyRMFScript) =>
  html`<div class="generated__order-page__main__container">
    <h1 class="generated__order-page__main__title"></h1>
    <div class="output__option-bar">
      <button class="option-bar__button">Print Order</button>
      <button @click=${resetHandler} class="option-bar__button">Reset</button>
      <button @click=${copyRMFScript} class="option-bar__button">Copy RMF Script</button>
      <input @click=${e => e.target.select()} @input=${searchHandler} .value="" placeholder="Search..." type="text" />
    </div>
    <div class="order__table__page__container">
      ${tableData(headerData, products, valueButtonClick, deleteHandler)}
      ${sideTable(products, valueButtonClick)}
    </div>
  </div>`;
