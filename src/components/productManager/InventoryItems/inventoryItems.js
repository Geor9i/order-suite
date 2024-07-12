import { render } from "lit-html";
import { serviceProvider } from "../../../services/serviceProvider.js";
import Modal from "../../shared/modal/modal.js";
import Program from "../../shared/program/program.js";
import { inventoryItemsTemplate } from "./inventoryItemsTemplate.js";
import { messages } from "../constants/communication.js";
import styles from './inventoryItems.scss';
import { html } from "lit-html";
import { db } from "../../../constants/db.js";
import { bus } from "../../../constants/busEvents.js";
export default class InventoryItems extends Program {
    constructor(windowContentElement, parentDataCallback, programConfig) {
        super();
        this.subscriberId = 'InventoryItems';
        this.subscriptionArr = [];
        this.programConfig = programConfig;
        this.firestoreService = serviceProvider.firestoreService;
        this.eventBus = serviceProvider.eventBus;
        this.template = inventoryItemsTemplate;
        this.harvester = serviceProvider.harvester;
        this.errorRelay = serviceProvider.errorRelay;
        this.parentDataCallback = parentDataCallback;
        this.windowContentElement = windowContentElement;
    }

    get inventoryRecords() {
        return this.firestoreService.userData?.[db.INVENTORY]?.[db.INVENTORY_RECORDS]?.[db.INVENTORY_ACTIVITY] ?? null;
    }

    boot() {
        this.subscriptionArr.forEach(unsubscribe => unsubscribe());
        const unsubscribe = this.eventBus.on(bus.USERDATA, this.subscriberId, this.render.bind(this));
        this.subscriptionArr = [unsubscribe];
        if (!this.inventoryRecords) {
            const buttons = [{ title: 'Import from Clipboard', confirmMessage: 'confirmed', callback: this.importProducts.bind(this)}];
            new Modal(this.windowContentElement, 'Inventory is Empty', 'Please Import Your Inventory Activity' , { buttons, noClose: true, noBackdrop: true });
        } else {
            this.render();
        }
    }

    close() {
        this.subscriptionArr.forEach(unsubscribe => unsubscribe());
    }

    render() {
        const controls = {
            toggleGroup: this.toggleGroup.bind(this)
        }
        render(this.template(this.inventoryRecords, controls), this.windowContentElement);
    }

    importProducts() {
           return navigator.clipboard.readText()
            .then(text => this.harvester.inventoryHarvest(text))
            .then(data => this.validateSendProductImport(data))
            .catch(err => this.errorRelay.send(err))
    }

    validateSendProductImport(data) {
        const {reportData, productData} = data;
        const minDaySpan = 30;
        const minProductGrops = 3;
        if (reportData.daySpan < minDaySpan) {
            throw new Error(`Report period must span for at least ${minDaySpan} days!`);
        } else if (Object.keys(productData).length < minProductGrops) {
            throw new Error(`Discovered product groups must be at least ${minProductGrops}!\nPlease include more product categories!`);
        }
        this.parentDataCallback(messages.INVENTORY_ACTIVITY_IMPORT, data);
        this.render();
    }

    toggleGroup(groupName) {
        const productContainer = document.querySelector(`.${styles['product-container']}`);
        const products = this.inventoryRecords[groupName];
        const template = (products) => html`
        <ul>
        ${Object.keys(products).map(productName => html`
            <li>${productName}</li>
            `)}
        </ul>
        `;
        render(template(products), productContainer);
    }
}