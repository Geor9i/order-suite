import BaseComponent from "../../framework/baseComponent";
import { productManagerTemplate } from "./productManagerTemplate";
import styles from './productManager.module.scss';
import w_styles from '../shared/window/window.scss';
import Window from '../shared/window/window.js';
import { bus } from "../../constants/busEvents.js";
import { userDataDetail } from "../../constants/userDataDetail.js";
import { barButtons } from "./constants/productManagerBarButtons.js";
export default class ProductManager extends BaseComponent {
    constructor({ renderBody, router, services, utils }) {
        super();
        this.authService = services.authService;
        this.firestoreService = services.firestoreService;
        this.userData = this.firestoreService.userData;
        this.subscriberId = 'ProductManager';
        this.eventBus = services.eventBus;
        this.jsEventBus = services.jsEventBus;
        this.eventBusUnsubscribeArr = [];
        this.jsEventUnsubscribeArr = [];
        this.windows = {};
        this.render = renderBody;
        this.router = router;
        this.eventUtil = utils.eventUtil;
        this.dateUtil = utils.dateUtil;
        this.domUtil = utils.domUtil;
        this.showView = this._showView.bind(this);
        this.sidebarBackdropInitialHover = false;
        this.sideBarHidden = false;
        console.log(this.userData);
    }

    init() {
        const unsubscribe = this.eventBus.on(bus.USERDATA, this.subscriberId, (data => this.userData = data));
        this.eventBusUnsubscribeArr.push(unsubscribe);
        this.jsEventBus.subscribe(this.subscriberId, 'click', this.setActiveWindow.bind(this), {target:[`.${w_styles['window']}`, `.${styles['bar-btn']}`]});
    }

    setActiveWindow(e) {
        const buffer = [];
        let activeIndex = null;
        Object.keys(this.windows).forEach(windowKey => {
            if (!this.windows[windowKey]) return;
            const window = this.windows[windowKey].window;
            const button = this.windows[windowKey].button;
            buffer.push(window)
            if (window.element.contains(e.target) || ( button.contains(e.target) && button.dataset.state !== 'minimized')) {
                activeIndex = buffer.length - 1;
            }
        })
        if (activeIndex !== null) {
            buffer.forEach((window, i) => i === activeIndex ? window.setActive() : window.setActive(false))
        }
    }

    sidebarPeek(e) {
        const sideBar = document.querySelector(`.${styles['side-bar']}`);
        const sidebarBackdrop = document.querySelector(`.${styles['side-bar-backdrop']}`);
        if (this.sidebarBackdropInitialHover && e.type === 'mouseout' && e.target === sidebarBackdrop) {
            this.sidebarBackdropInitialHover = false;
            return;
        }
        if (!this.sidebarBackdropInitialHover && e.type === 'mouseover') {
            sideBar.classList.remove(styles['side-bar-hidden']);
        } else if (!this.sidebarBackdropInitialHover && e.type === 'mouseout') {
            sideBar.classList.add(styles['side-bar-hidden']);
        }
       
    }

    destroy() {
        this.eventBusUnsubscribeArr.forEach(unsubscribe => unsubscribe());
        this.jsEventUnsubscribeArr.forEach(unsubscribe => unsubscribe());
        Object.keys(this.windows).forEach(windowId => this.windows[windowId].subscriptions.forEach(unsubscribe => unsubscribe()));
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
    }

    toggleSidebar() {
        const sideBar = document.querySelector(`.${styles['side-bar']}`);
        const arrowButton = document.getElementById('toggle-bar');
        const arrowElement = arrowButton.querySelector(`i`);
        arrowElement.className = this.sideBarHidden ? 'fa-solid fa-caret-left' : 'fa-solid fa-caret-right';

        if (!this.sideBarHidden) {
            const unsubscribe1 = this.jsEventBus.subscribe(this.subscriberId, 'mouseover', this.sidebarPeek.bind(this), {target: [`.${styles['side-bar-backdrop']}`, `.${styles['side-bar']}`]});
            const unsubscribe2 = this.jsEventBus.subscribe(this.subscriberId, 'mouseout', this.sidebarPeek.bind(this), {target: [`.${styles['side-bar-backdrop']}`, `.${styles['side-bar']}`]});
            this.jsEventUnsubscribeArr.push(unsubscribe1, unsubscribe2);
            this.sidebarBackdropInitialHover = true;
            sideBar.classList.add(styles['side-bar-hidden']);
            arrowButton.className = `${styles['bar-btn']} ${styles['show-arrow']}`;
            this.sideBarHidden = true;
        } else {
            this.jsEventUnsubscribeArr.forEach(unsubscribe => unsubscribe());
            this.sidebarBackdropInitialHover = false;
            sideBar.classList.remove(styles['side-bar-hidden']);
            arrowButton.className = `${styles['bar-btn']} ${styles['hide-arrow']}`;
            this.sideBarHidden = false;
        }
    }

    toggleWindow(e) {
        const windowContainer = document.querySelector(`.${styles['container']}`)
        const button = e.currentTarget;
        const { description, state } = button.dataset;
        const subscriberId = description.split(' ').join('_');
        if (state === 'closed') {
            button.dataset.state = 'active';
            button.classList.add(styles['bar-button-active']);
            const config = barButtons.find(entry => entry.description === description);
            const window = new Window(windowContainer, description);
            config?.class && window.boot(config.class, this.userData[userDataDetail.PRODUCTS]);
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
                button,
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
