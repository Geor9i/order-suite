import { html } from "../../../node_modules/lit-html/lit-html.js";
import styles from './orderPage.module.scss';

let tableData = (headerData, products, valueButtonClick, deleteHandler) => html`
  <div class=${styles['order__table__header']}>
    ${
      html`
     <div class=${styles['data-table-header']}>
      <div class=${styles['data-table-th']}><p>Product</p></div>
      <div class=${styles['data-table-th']}><p>Order</p></div>
      <div class=${styles['data-table-th']}>
        <p>Weekly</p>
        <p>Usage</p>
      </div>
      <div class=${styles['data-table-th']}><p>Price</p></div>
      <div class=${styles['data-table-th']}>
        <p>Current</p>
        <p>Stock</p>
      </div>
      <div class=${styles['data-table-th']}>
        <p>Stock on</p>
        <p>${headerData.invoiceDay.weekday}</p>
        <p>${headerData.invoiceDay.date}</p>
      </div>
      <div class=${styles['data-table-th']}>
        <p>Stock on</p>
        <p>${headerData.nextInvoiceDay.weekday}</p>
        <p>${headerData.nextInvoiceDay.date}</p>
      </div>
      <div class=${styles['data-table-th']}></div>
    </div>`}
  </div>
  <div class=${styles['data-table-container']}>
    <div class=${styles['data-table']}>
      ${Object.keys(products).map((productId) => {
        let current = products[productId];
        if (current.order) {
          return html` <div class=${styles['product-table-tr']} id="${current.id}">
            <div class=${styles['td']}>${current.product}</div>
            <div class=${`${styles['td']} ${styles['order-value-td']}`}>
              <button data-id="${productId}" @click=${valueButtonClick} id="main-minus" class=${styles['value-button']}>-</button>
              <p>${current.order}</p>
              <button data-id="${productId}" @click=${valueButtonClick} id="main-plus" class=${styles['value-button']}>+</button>
            </div>
            <div class=${styles['td']}>${current.weeklyUsage}</div>
            <div class=${styles['td']}>${current.price}</div>
            <div class=${styles['td']}>${current.onHand}</div>
            <div class=${styles['td']}>${current.stockOnOrderDay}</div>
            <div class=${styles['td']}>${current.nextOrderDayOnHand}</div>
            <div class=${styles['td']}>
              <button data-id="${productId}" @click=${deleteHandler} class=${styles['product-delete-btn']}>Delete</button>
            </div>
          </div>`;
        }
      })}
    </div>
  </div>
`;

let sideTable = (products, valueButtonClick) => html`
  <div class=${styles['side-item-screen']}>
    <div id="side-table__search">
      ${Object.keys(products).map((productId) => {
        let current = products[productId];
        const show = current.order === 0 && current.sideDisplay === true;
        return html`
          <div id=${productId} class=${`${styles['side-table-tr']} ${!show? styles["hidden"] : ""}`}>
            <p class=${styles['td']}>${current.product}</p>
              <button data-id=${productId} @click=${valueButtonClick} id="side-plus" class=${styles['side-value-button']}>+</button>
          </div>
        `;
      })}
    </div>
  </div>
`;

export const orderPageTemplate = (headerData, products, searchHandler, valueButtonClick, deleteHandler, resetHandler, copyRMFScript) =>
  html`<div class=${styles['page__container']}>
    <h1 class=${styles['main__title']}></h1>
    <div class=${styles['option-bar']}>
      <button class=${styles['option-bar__button']}>Print Order</button>
      <button @click=${resetHandler} class=${styles['option-bar__button']}>Reset</button>
      <button @click=${copyRMFScript} class=${styles['option-bar__button']}>Copy RMF Script</button>
      <input @click=${e => e.target.select()} @input=${searchHandler} .value="" placeholder="Search..." type="text" />
    </div>
    <div class=${styles['order__table__container']}>
      ${tableData(headerData, products, valueButtonClick, deleteHandler)}
      ${sideTable(products, valueButtonClick)}
    </div>
  </div>`;
