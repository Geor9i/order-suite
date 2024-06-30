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
        this.jsEventUnsubscribeArr = [];
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
        this.sidebarPeeking = false;
        this.sidebar = null;
        this.sidebarBackdrop = null;
    }

    init() {
        const unsubscribe1 = this.jsEventBus.subscribe(this.jsEventBusSubscriberId, 'mouseover', this.sidebarPeek.bind(this), {target: [`.${styles['side-bar-backdrop']}`, `.${styles['side-bar']}`]})
        this.jsEventUnsubscribeArr.push(unsubscribe1);
    }

    sidebarPeek(e) {
        this.sideBar = this.sidebar || document.querySelector(`.${styles['side-bar']}`);
        this.sidebarBackdrop = this.sidebarBackdrop || document.querySelector(`.${styles['side-bar-backdrop']}`);
        if (e.target === this.sideBar && this.sidebarPeeking) {
            this.sideBar.classList.add(styles['side-bar-hidden']);
            this.sidebarBackdrop.classList.remove(styles['side-bar-backdrop-inactive']);
            this.sidebarPeeking = false;
        } else if (e.target === this.sidebarBackdrop && !this.sidebarPeeking) {
            this.sideBar.classList.remove(styles['side-bar-hidden']);
            this.sidebarBackdrop.classList.add(styles['side-bar-backdrop-inactive']);
            this.sidebarPeeking = true;
        }
        console.log(this.sidebarPeeking);
       
    }

    destroy() {
        this.jsEventUnsubscribeArr.forEach(unsubscribe => unsubscribe());
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
        const functions = {
            toggleSidebar: this.toggleSidebar.bind(this)
        }
        this.render(productManagerTemplate(functions));
        const windowContainer = document.querySelector(`.${styles['container']}`)
        const {window, content} = new Window(windowContainer, 'inventory');
        console.log({window, content});
        
        render(inventoryProductsTemplate(), content)
    }

    toggleSidebar() {
        const sideBar = document.querySelector(`.${styles['side-bar']}`);
        this.domUtil.addRemoveClass(sideBar, styles['side-bar-hidden']);
    }

}
