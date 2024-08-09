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
import { utils } from "../../../utils/utilConfig.js";
import { v4 as uuid} from 'uuid';
import { inventoryItemsRecordPickerTemplate } from "./inventoryItemsRecordPickerTemplate.js";
export default class InventoryItems extends Program {
    constructor(windowContentElement, parentDataCallback, programConfig) {
        super();
        this.subscriberId = 'InventoryItems';
        this.subscriptionArr = [];
        this.programConfig = programConfig;
        this.firestoreService = serviceProvider.firestoreService;
        this.eventBus = serviceProvider.eventBus;
        this.objUtil = utils.objUtil;
        this.dateUtil = utils.dateUtil;
        this.inventoryProductsTemplate = inventoryItemsTemplate;
        this.recordPickerTemplate = inventoryItemsRecordPickerTemplate;
        this.harvester = serviceProvider.harvester;
        this.errorRelay = serviceProvider.errorRelay;
        this.parentDataCallback = parentDataCallback;
        this.windowContentElement = windowContentElement;
        this.inventoryItems = this.firestoreService.userData?.[db.INVENTORY]?.[db.INVENTORY_ITEMS];
        this.selectedReports = new Map();
    }

    get inventoryRecords() {
        return this.firestoreService.userData?.[db.INVENTORY]?.[db.INVENTORY_RECORDS]?.[db.INVENTORY_ACTIVITY] ?? null;
    }

    boot() {
        this.subscriptionArr.forEach(unsubscribe => unsubscribe());
        if (this.objUtil.isEmpty(this.inventoryItems)) {
            const buttons = [{ title: 'Create', confirmMessage: 'confirmed', callback: this.renderPicker.bind(this)}];
            new Modal(this.windowContentElement, 'Inventory products not set ', 'Would you like to create a new inventory?' , { buttons, noClose: true, noBackdrop: true });
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
        render(this.inventoryProductsTemplate(this.inventoryRecords, controls), this.windowContentElement);
    }

    renderPicker() {
        const controls = {
            addRecord: this.importData.bind(this),
            deleteRecord: this.deleteRecord.bind(this),
            buildInventory: this.buildInventory.bind(this),
            selectReport: this.selectReport.bind(this)
        }
        render(this.recordPickerTemplate(this.inventoryRecords, controls), this.windowContentElement);
    }

    async importData() {
        try {
            const text = await navigator.clipboard.readText();
            const data = this.harvester.inventoryHarvest(text);
            if (data) {
                const id = `${data.reportData.importDate}_${uuid()}`;
                data.reportData.id = id;
                await this.firestoreService.importInventoryRecord(id, data);
                this.renderPicker();
            }
        } catch(err) {
            this.errorRelay.send(err);
        }
    }

    selectReport(e, record) {
        const isChecked = e.target.checked;
        const id = record.reportData.id;
        if (isChecked) {
            this.selectedReports.set(id, record)
        } else {
            this.selectedReports.delete(id);
        }
    }

    async buildInventory() {
        try{
            if (!this.selectedReports.size) {
                throw new Error('Please select at least one inventory report to build your Inventory!');
            }
            const inventory = {};
            const reports = [...this.selectedReports]
            .sort((a, b) => new Date(b[1].reportData.importDate).getTime() - new Date(a[1].reportData.importDate).getTime());
            
            reports.forEach(([id, record]) => {
                const {reportData, productData} = record;
                const { startDate, endDate, daySpan } = reportData;
                const dateArr = this.dateUtil.dateSpanArray(startDate, endDate, false);
                for (let category in productData) {
                    if (!inventory.hasOwnProperty(category)) {
                        inventory[category] = {};
                    }
                    for (let product in productData[category]) {
                        if (!inventory[category].hasOwnProperty(product)) {
                            const { unit, reportName, reportUnitPrice } = productData[category][product]
                            inventory[category][product] = {
                                unit,
                                reportName,
                                history: dateArr.reduce((obj, date) => {
                                    obj[date] = {
                                        ...[ 'actual', 'actualCost', 'missing', 'missingCost', 'theoretical', 'theoreticalCost', 'variance', 'varianceCost', 'waste', 'wasteCost']
                                        .reduce((statObj, stat) => {
                                            statObj[stat] = productData[category][product][stat] / daySpan;
                                            return statObj;
                                        }, {}),
                                        reportUnitPrice
                                    };
                                    return obj;
                                }, {})
                            }
                        }
                    }
                }
            })
            console.log(inventory);
            
        }catch(err) {
            this.errorRelay.send(err);
        }
    }

    async deleteRecord(record) {
        const id = record.reportData.id;
        await this.firestoreService.deleteInventoryRecord(id, db.INVENTORY_ACTIVITY);
        this.selectedReports.delete(id);
        this.renderPicker();
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