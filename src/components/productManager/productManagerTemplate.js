import { html } from 'lit-html';
import styles from './productManager.module.scss'


export const productManagerTemplate = (slideOpen, records, products, rules) => html`
<div class=${styles['page__container']}>
    <div @click=${slideOpen} class=${styles['section__bar']}  data-id="inventory-records">Inventory Records</div>
    <div class=${styles['expand__container']} id="inventory-records">
        <div class=${styles['expand-content']}>
            <div class=${styles['top-control-bar']}>
                <button class=${styles['add-btn']}>Add Record</button>
            </div>
            <div class=${styles['inventory-analysis-table-container']}>
                <div class=${styles['table-header']}>
                    <p>Name</p>
                    <p>Date from</p>
                    <p>Date to</p>
                    <p>Product Groups</p>
                    <p>Actions</p>
                </div>
                <div class=${styles['table-body']}>
                    ${records.map(record => recordItem({ ...record }))}
                </div>
            </div>
        </div>
    </div>
    <div @click=${slideOpen} class=${styles['section__bar']} data-id="product-manager">Product Manager</div>
    <div class=${styles['expand__container']} id="product-manager">
        <div class=${styles['expand-content']}>
            <div class=${styles['table-header']}>
                <p>Name</p>
                <p>Group</p>
                <p>Status</p>
                <p>Active Rule</p>
                <p>Actions</p>
            </div>
            <div class=${styles['table-body']}>
                ${Object.keys(products).map(productId => productItem({ ...products[productId] }))}
            </div>
        </div>
    </div>
    <div @click=${slideOpen} class=${styles['section__bar']} data-id="product-rules">Product Rules</div>
    <div class=${styles['expand__container']} id="product-rules">
        <div class=${styles['expand-content']}>
            <div class=${`${styles['table-header']} ${styles['product-rules-item']}`}>
                <p>Name</p>
                <p>Status</p>
                <p>Actions</p>
            </div>
            <div class=${styles['table-body']}>
                ${Object.keys(rules).map(ruleId => ruleItem({ ...rules[ruleId] }))}
            </div>
        </div>
    </div>
</div>`;


const recordItem = ({ name, dateFrom, dateTo, groups }) => html`
<div class=${styles['table-item']}>
<p>${name}</p>
<p>${dateFrom}</p>
<p>${dateTo}</p>
<p>${groups}</p>
<div class=${styles['inventory-btn-container']}>
    <button class=${styles['inventory-edit-btn']}>Edit</button>
    <button class=${styles['inventory-delete-btn']}>Delete</button>
</div>
</div>`;

const productItem = ({ name, group, status, rules }) => html`
<div class=${styles['table-item']}>
<p>${name}</p>
<p>${group}</p>
<p>${status}</p>
<p>${rules}</p>
<div class=${styles['inventory-btn-container']}>
    <button class=${styles['inventory-edit-btn']}>Edit</button>
    <button class=${styles['inventory-delete-btn']}>Delete</button>
</div>
</div>`;

const ruleItem = ({ name, status }) => html`
<div class=${`${styles['table-item']} ${styles['product-rules-item']}`}>
<p>${name}</p>
<p>${status}</p>
<div class=${styles['inventory-btn-container']}>
    <button class=${styles['inventory-edit-btn']}>Edit</button>
    <button class=${styles['inventory-delete-btn']}>Delete</button>
</div>
</div>`

