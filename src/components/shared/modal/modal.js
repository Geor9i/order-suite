import { render } from "lit-html";
import { serviceProvider } from "../../../services/serviceProvider.js";
import styles from './modal.scss';
import { utils } from "../../../utils/utilConfig.js";
import { modalTemplate } from "./modalTemplate.js";
import { v4 as uuid } from 'uuid';
export default class Modal {
    constructor(parent, title, message, options) {
        this.message = message;
        this.jsEventBusSubscriberId = `Modal_${uuid()}`;
        this.parent = parent;
        this.eventUtil = utils.eventUtil;
        this.jsEventBus = serviceProvider.jsEventBus;
        this.jsEvenUnsubscribeArr = [];
        this.element = null;
        this.modalBackdrop = null;
        this.events = {};
        this.program = null;
        this.create(title, message, options);
        this.contentContainer = this.element.querySelector(`.${styles['content']}`);
    }

    init() {
    }
    destroy() {
        this.element.remove();
        this.modalBackdrop && this.modalBackdrop.remove();
    }
    create(title, message, options) {
        this.buildModal(title, message, options);
        this.init();
    }

    buildModal(title, message, options) {
        const modal = document.createElement('div');
        modal.classList.add(styles['modal']);
        this.parent.appendChild(modal);
        if (!options?.noBackdrop)  {
            this.modalBackdrop = document.createElement('div');
            this.modalBackdrop.classList.add(styles['modal-backdrop']);
            this.modalBackdrop.addEventListener('click', this.closeModal.bind(this));
            this.parent.appendChild(this.modalBackdrop);
            if (options?.backdropStyles) {
                Object.keys(options.backdropStyles).forEach(styleProp => this.modalBackdrop.style[styleProp] = options.backdropStyles[styleProp]);
            }
        }
        const controls = {
            confirm: this.confirmModal.bind(this),
            close: this.closeModal.bind(this),
        }
        render(modalTemplate(title, message, controls, options), modal);
        this.element = modal;
        if (options?.program) {
            const contentContainer = modal.querySelector(`.${styles['content']}`);
            this.program = new options.program.class(contentContainer, options.program?.callback);
            this.program.boot();
        }
        if (options?.styles) {
            Object.keys(options.styles).forEach(styleProp => modal.style[styleProp] = options.styles[styleProp]);
        }
    }
    async confirmModal(buttonOptions) {
        if (buttonOptions?.callback) {
            const data = await buttonOptions.callback();
            if (data) {
                this.emit(buttonOptions.confirmMessage, data);
                this.closeModal();
            }
        }
    }

    closeModal() {
        this.destroy();
        this.program && this.program.close();
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