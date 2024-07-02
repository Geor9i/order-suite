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
        this.windows = {};
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
        this.sidebarBackdropInitialHover = false;
        this.sideBarHidden = false;
        this.sidebar = null;
        this.sidebarBackdrop = null;
    }

    init() {
    }

    sidebarPeek(e) {
        this.sideBar = this.sidebar || document.querySelector(`.${styles['side-bar']}`);
        this.sidebarBackdrop = this.sidebarBackdrop || document.querySelector(`.${styles['side-bar-backdrop']}`);
        if (this.sidebarBackdropInitialHover && e.type === 'mouseout' && e.target === this.sidebarBackdrop) {
            this.sidebarBackdropInitialHover = false;
            return;
        }
        if (!this.sidebarBackdropInitialHover && e.type === 'mouseover') {
            this.sideBar.classList.remove(styles['side-bar-hidden']);
        } else if (!this.sidebarBackdropInitialHover && e.type === 'mouseout') {
            this.sideBar.classList.add(styles['side-bar-hidden']);
        }
       
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
            toggleSidebar: this.toggleSidebar.bind(this),
            toggleWindow: this.toggleWindow.bind(this)
        }
        this.render(productManagerTemplate(functions));
        // const windowContainer = document.querySelector(`.${styles['container']}`)
        // const {window, content} = new Window(windowContainer, 'inventory');
        // console.log({window, content});
        // render(inventoryProductsTemplate(), content)
    }

    toggleSidebar() {
        this.sideBar = this.sidebar || document.querySelector(`.${styles['side-bar']}`);
        const arrowButton = document.getElementById('toggle-bar');
        const arrowElement = arrowButton.querySelector(`i`);
        arrowElement.className = this.sideBarHidden ? 'fa-solid fa-caret-left' : 'fa-solid fa-caret-right';

        if (!this.sideBarHidden) {
            const unsubscribe1 = this.jsEventBus.subscribe(this.jsEventBusSubscriberId, 'mouseover', this.sidebarPeek.bind(this), {target: [`.${styles['side-bar-backdrop']}`, `.${styles['side-bar']}`]});
            const unsubscribe2 = this.jsEventBus.subscribe(this.jsEventBusSubscriberId, 'mouseout', this.sidebarPeek.bind(this), {target: [`.${styles['side-bar-backdrop']}`, `.${styles['side-bar']}`]});
            this.jsEventUnsubscribeArr.push(unsubscribe1, unsubscribe2);
            this.sidebarBackdropInitialHover = true;
            this.sideBar.classList.add(styles['side-bar-hidden']);
            arrowButton.className = `${styles['bar-btn']} ${styles['show-arrow']}`;
            this.sideBarHidden = true;
        } else {
            this.jsEventUnsubscribeArr.forEach(unsubscribe => unsubscribe());
            this.sidebarBackdropInitialHover = false;
            this.sideBar.classList.remove(styles['side-bar-hidden']);
            arrowButton.className = `${styles['bar-btn']} ${styles['hide-arrow']}`;
            this.sideBarHidden = false;
        }
    }

    toggleWindow(e) {
        const windowContainer = document.querySelector(`.${styles['container']}`)
        const button = e.currentTarget;
        const { name, state } = button.dataset;
        const subscriberId = name.split(' ').join('_');
        console.log(state);
        if (state === 'closed') {
            button.dataset.state = 'active';
            button.classList.add(styles['bar-button-active']);
            const window = new Window(windowContainer, name);
            const unsubscribe = window.on('minimizeTarget', subscriberId, () => {
                const {rect} = this.eventUtil.elementData(button);
                const {rect: parentRect} = this.eventUtil.elementData(windowContainer);
                window.minimizeTransition = {
                    ...rect,
                    left: rect.left - parentRect.left,
                    top: rect.top - parentRect.top
                }
            })
            const unsubscribe1 = window.on('windowMinimized', subscriberId, () => {
                button.classList.add(styles['bar-button-minimized']);
                button.dataset.state = 'minimized';
            })
            const unsubscribe2 = window.on('closeWindow', subscriberId, () => {
                button.classList.remove(styles['bar-button-minimized'], styles['bar-button-active']);
                button.dataset.state = 'closed';
                this.windows[subscriberId].subscriptions.forEach(unsubscribe => unsubscribe());
                this.windows[subscriberId] = null;
            })
            this.windows[subscriberId] = {
                window,
                subscriptions: [unsubscribe, unsubscribe1, unsubscribe2]};
        } else if (state === 'minimized') {
            this.windows[subscriberId].window.emit('maximizeWindow');
            button.classList.remove(styles['bar-button-minimized']);
            button.dataset.state = 'active';
        }else if (state === 'active') {
            const {rect} = this.eventUtil.elementData(button);
            const {rect: parentRect} = this.eventUtil.elementData(windowContainer);
            this.windows[subscriberId].window.minimizeTransition = {
                ...rect,
                left: rect.left - parentRect.left,
                top: rect.top - parentRect.top
            }
            this.windows[subscriberId].window.minimizeWindow();
            button.classList.add(styles['bar-button-minimized']);
            button.dataset.state = 'minimized';

        }
    }



}
