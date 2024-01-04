import { html } from 'lit-html';
import styles from './productManager.module.css'


export const productManagerTemplate = (slideOpen) => html`
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
                    <div class=${styles['table-item']}>
                        <p>Packaging</p>
                        <p>26/07/2023</p>
                        <p>03/11/2023</p>
                        <p>Ambient Packaging, Chilled, Frozen</p>
                        <div class=${styles['inventory-btn-container']}>
                            <button class=${styles['inventory-edit-btn']}>Edit</button>
                            <button class=${styles['inventory-delete-btn']}>Delete</button>
                        </div>
                    </div>
                    <div class=${styles['table-item']}>
                        <p>Chilled</p>
                        <p>01/09/2023</p>
                        <p>31/12/2023</p>
                        <p>Ambient Packaging, Chilled, Frozen</p>
                        <div class=${styles['inventory-btn-container']}>
                            <button class=${styles['inventory-edit-btn']}>Edit</button>
                            <button class=${styles['inventory-delete-btn']}>Delete</button>
                        </div>
                    </div>
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
                
            </div>
        </div>
    </div>
</div>`;



