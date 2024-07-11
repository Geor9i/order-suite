import { render } from "lit-html";
import { serviceProvider } from "../../../services/serviceProvider.js";
import Program from "../../shared/program/program.js";
import { openOrderEditorTemplate } from "./openOrderEditorTemplate.js";
import styles from './openOrderEditor.scss';
import { db } from "../../../constants/db.js";
import { bus } from "../../../constants/busEvents.js";

export default class OpenOrderEditor extends Program {
    constructor(contentElement) {
        super();
        this.subscriberId = 'OpenOrderEditor';
        this.subscriptionArr = [];
        this.firestoreService = serviceProvider.firestoreService;
        this.eventBus = serviceProvider.eventBus;
        this.template = openOrderEditorTemplate;
        this.harvester = serviceProvider.harvester;
        this.errorRelay = serviceProvider.errorRelay;
        this.contentElement = contentElement;
        console.log(openOrderEditorTemplate);
    }

    get openOrders() {
        return this.firestoreService.userData?.[db.INVENTORY]?.[db.INVENTORY_RECORDS]?.[db.OPEN_ORDERS] ?? null;
    }

    boot() {
        this.subscriptionArr.forEach(unsubscribe => unsubscribe());
        const unsubscribe = this.eventBus.on(bus.USERDATA, this.subscriberId, this.render.bind(this));
        this.subscriptionArr = [unsubscribe];
        this.render();
    }

    close() {
        this.subscriptionArr.forEach(unsubscribe => unsubscribe());
    }

    render() {
        const controls = {
        }
        render(this.template(this.openOrders, controls), this.contentElement);
    }

    importProducts() {
           return navigator.clipboard.readText()
            .then(text => this.harvester.inventoryHarvest(text))
            .then(data => this.validateSendProductImport(data))
            .catch(err => this.errorRelay.send(err))
    }

}