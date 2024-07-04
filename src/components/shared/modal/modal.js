import { render } from "lit-html";
import { serviceProvider } from "../../../services/serviceProvider.js";
import styles from './modal.scss';
import { utils } from "../../../utils/utilConfig.js";
import { modalTemplate } from "./modalTemplate.js";

export default class Modal {
    constructor(parent, title, options) {
        this.title = title;
        this.jsEventBusSubscriberId = `Modal_${Math.random() * 1000000}`;
        this.parent = parent;
        this.eventUtil = utils.eventUtil;
        this.jsEventBus = serviceProvider.jsEventBus;
        this.jsEvenUnsubscribeArr = [];
        this.element = null;
        this.events = {};
        this.program = null;
        this.create(options);
        this.contentContainer = this.element.querySelector(`.${styles['content']}`);
    }

    init() {
    }
    destroy() {
        this.element.remove();
    }
    create() {
        this.buildModal();
        this.init();
    }

    buildModal(options) {
        const modal = document.createElement('div');
        modal.classList.add(styles['modal']);
        this.parent.appendChild(modal);
        if (options?.backdrop)  {
            const modalBackdrop = document.createElement('div');
            modalBackdrop.classList.add(styles['modal-backdrop']);
            this.parent.appendChild(modalBackdrop);
        }
        const controls = {
            confirm: this.confirmModal.bind(this),
            close: this.closeModal.bind(this),
        }
        render(modalTemplate(this.title, controls, options), modal);
        this.element = modal;
    }
    confirmModal(buttonOptions) {
        buttonOptions?.callback && buttonOptions.callback()
        this.emit('confirmModal', keyword);
    }

    closeModal() {
        this.destroy()
        this.emit('closeModal');
    };
    
    on(eventType, subscriberId, callback) {
        if(this.events.hasOwnProperty(eventType)) {
            if (this.events[eventType].hasOwnProperty(subscriberId)) {
                this.events[eventType][subscriberId].push({callback});
            }else {
                this.events[eventType][subscriberId] = [{callback}];
            }
        } else {
            this.events[eventType] = {
                [subscriberId]: [{callback}]
            };
        }
        
        const subscribtionIndex = this.events[eventType][subscriberId].length - 1;
        return () => {
            this.events[eventType][subscriberId].splice(subscribtionIndex, 1);
        }
    }

    emit(eventType, data = null) {
        if (this.events.hasOwnProperty(eventType)) {
            Object.keys(this.events[eventType]).forEach(subscriberId  => {
                this.events[eventType][subscriberId].forEach(subscription => subscription.callback(data));
            })
        }
    }
}