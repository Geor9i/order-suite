import BaseComponent from "../../framework/baseComponent";
import { productManagerTemplate } from "./productManagerTemplate";
import styles from './productManager.module.scss';
import Window from '../shared/window.js';
import { inventoryProductsTemplate } from "./inventoryProductsTemplate.js";
import { render } from "lit-html";
export default class ProductManager extends BaseComponent {
    constructor({ renderBody, router, services, utils }) {
        super();
        this.jsEventBus = services.jsEventBus;
        this.jsEventBusSubscriberId = 'ProductManager';
        this.render = renderBody;
        this.router = router;
        this.authService = services.authService;
        this.eventUtil = utils.eventUtil;
        this.timeUtil = utils.timeUtil;
        this.dateUtil = utils.dateUtil;
        this.domUtil = utils.domUtil;
        this.showView = this._showView.bind(this);
        this.isDraggin = false;
        this.dragElement = null;
    }

    init() {
    }

    destroy() {
    }

    getRestaurantData() {
        return {
            openTimes: {
                monday: { startTime: "11:00", endTime: "23:00" },
                tuesday: { startTime: "11:00", endTime: "23:00" },
                wednesday: { startTime: "11:00", endTime: "23:00" },
                thursday: { startTime: "11:00", endTime: "23:00" },
                friday: { startTime: "11:00", endTime: "23:00" },
                saturday: { startTime: "11:00", endTime: "23:00" },
                sunday: { startTime: "11:00", endTime: "23:00" },
            },
        };
    }


    _showView() {
        if (!this.authService.user) {
            this.router.redirect("/");
            return;
        }
        this.render(productManagerTemplate());
        const windowContainer = document.querySelector(`.${styles['container']}`)
        const {window, content} = new Window(windowContainer, 'inventory');
        console.log({window, content});
        render(inventoryProductsTemplate(), content)
    }

}
