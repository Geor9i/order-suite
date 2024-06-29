import { serviceProvider } from "../../services/serviceProvider.js";
import styles from './window.scss';
import { utils } from "../../utils/utilConfig.js";
import { render } from "lit-html";
import { windowTemplate } from "./windowTemplate.js";

export default class Window {
    constructor(parent, title) {
        this.title = title;
        this.jsEventBusSubscriberId = `${Math.random() * 1000000}`;
        this.parent = parent;
        this.eventUtil = utils.eventUtil;
        this.jsEventBus = serviceProvider.jsEventBus;
        this.jsEvenUnsubscribeArr = [];
        this.isDraggin = false;
        this.anchor = null;
        this.anchorName = null;
        this.anchors = ['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];
        this.window = null;
        this.parentRect = null;
        this.windowState = {};
        this.isMaximized = false;
    }

    init() {
        const subscription1 = this.jsEventBus.subscribe(this.jsEventBusSubscriberId, 'mousedown', this.dragStart.bind(this), {target: this.window});
        const subscription2 = this.jsEventBus.subscribe(this.jsEventBusSubscriberId, 'mousemove', this.dragOver.bind(this));
        const subscription3 = this.jsEventBus.subscribe(this.jsEventBusSubscriberId, 'mouseup', this.dragEnd.bind(this));
        this.jsEvenUnsubscribeArr.push(subscription1, subscription2, subscription3);
    }
    destroy() {
        this.jsEvenUnsubscribeArr.forEach(unsubscribe => unsubscribe());
        this.window.remove();
    }

    showView() {
        this.buildWindow();
        this.init();
    }

    buildWindow() {
        const window = document.createElement('div');
        window.classList.add(styles['window'], styles['draggable']);
        this.parent.appendChild(window);
        const close = this.closeWindow.bind(this);
        const maximize = this.maximizeWindow.bind(this);
        const controls = {close, maximize, state: this.isMaximized}
        render(windowTemplate(this.title, controls), window);
        this.window = window;
    }

    closeWindow() {
        this.destroy()
    };
    maximizeWindow() {
        const button = document.querySelector(`.${styles['maximize']}`);
        const i = button.querySelector('i');
        if (this.isMaximized) {
            this.window.style.top = `${this.windowState.top}px`;
            this.window.style.left = `${this.windowState.left}px`;
            this.window.style.height = `${this.windowState.height}px`;
            this.window.style.width = `${this.windowState.width}px`;
            this.isMaximized = false;
            i.className = 'fa-solid fa-up-right-and-down-left-from-center';
        } else {
            this.windowState = this.eventUtil.elementData(this.window).rect;
            const { rect } = this.eventUtil.elementData(this.parent);
            this.window.style.top = `${0}px`;
            this.window.style.left = `${0}px`;
            this.window.style.height = `${rect.height}px`;
            this.window.style.width = `${rect.width}px`;
            this.isMaximized = true;
            i.className = 'fa-solid fa-down-left-and-up-right-to-center';
        }
    };

    dragStart(e) {
        let draggable = e.target;
        if (!e.target.classList.contains(styles['draggable'])) {
            draggable = this.window;
        }
        this.isDraggin = true;
        const { clientX, clientY } = e;
        const { rect } = this.eventUtil.elementData(draggable);
        this.parentRect = this.eventUtil.elementData(this.parent).rect;
        if (e.target.classList.contains(styles['edge']) || e.target.classList.contains(styles['vertex'])) {
            this.anchor = draggable;
            this.anchorName = draggable.dataset.id;
        }
        const { rect: windowRect } = this.eventUtil.elementData(this.window);
        this.windowRect = windowRect;
        this.oldLeft = windowRect.left;
        this.oldTop = windowRect.top;
        this.oldWidth = windowRect.width;
        this.oldHeight = windowRect.height;
        this.oldMouseX = clientX;
        this.oldMouseY = clientY;
        this.dragOffsetX = clientX + this.parentRect.left - rect.left;
        this.dragOffsetY = clientY + this.parentRect.top - rect.top;
      }
    
      dragOver(e) {
        if (!this.isDraggin) return;

        if(this.anchor) {
            this.resize(e);
            return;
        }

          const { clientX, clientY } = e;
          const offsetX = clientX - this.dragOffsetX
          const offsetY = clientY - this.dragOffsetY
          if (offsetY > 0 && offsetY < this.parentRect.height - this.windowRect.height) {
              this.window.style.top = `${offsetY}px`;
            }
            if (offsetX > 0 && offsetX < this.parentRect.width - this.windowRect.width) {
                this.window.style.left = `${offsetX}px`;
          }
      }
    
      dragEnd(e) {
        this.isDraggin = false;
        this.dragElement = null;
        this.anchor = null;
        this.anchorName = null;
      }

      resize(e) {
        const { clientX, clientY } = e;
        const newLeft = clientX - this.dragOffsetX;
        const newTop = clientY - this.dragOffsetY;
        // Define minimum size to prevent collapsing
        const minSize = 300;

        const resizeFunctions = {
            'top-left': () => {
                const newWidth = this.oldWidth - (clientX - this.oldMouseX);
                if (newWidth > minSize && newWidth > this.parentRect.left) {
                    this.window.style.width = `${newWidth}px`;
                    this.window.style.left = `${newLeft}px`;
                }
                const newHeight = this.oldHeight - (clientY - this.oldMouseY);
                if (newHeight > minSize && newTop > 0) {
                    this.window.style.height = `${newHeight}px`;
                    this.window.style.top = `${newTop}px`;
                }
            },
            'top-right': () => {
                const newWidth = this.oldWidth + (clientX - this.oldMouseX);
                if (newWidth > minSize && newWidth < this.parentRect.right) {
                    this.window.style.width = `${newWidth}px`;
                }
                const newHeight = this.oldHeight - (clientY - this.oldMouseY);
                if (newHeight > minSize && newTop > 0) {
                    this.window.style.height = `${newHeight}px`;
                    this.window.style.top = `${newTop}px`;
                }
            },
            'bottom-left': () => {
                const newHeight = this.oldHeight + (clientY - this.oldMouseY);
                if (newHeight > minSize && newHeight < this.parentRect.bottom) {
                    this.window.style.height = `${newHeight}px`;
                }
                const newWidth = this.oldWidth - (clientX - this.oldMouseX);
                if (newWidth > minSize && newHeight < this.parentRect.bottom) {
                    this.window.style.width = `${newWidth}px`;
                    this.window.style.left = `${newLeft}px`;
                }
            },
            'bottom-right': () => {
                const newWidth = this.oldWidth + (clientX - this.oldMouseX);
                if (newWidth > minSize && newWidth < this.parentRect.right) {
                    this.window.style.width = `${newWidth}px`;
                }
                const newHeight = this.oldHeight + (clientY - this.oldMouseY);
                if (newHeight > minSize && newHeight < this.parentRect.bottom) {
                    this.window.style.height = `${newHeight}px`;
                }
            },
            'top': () => {
                const newHeight = this.oldHeight - (clientY - this.oldMouseY);
                console.log(this.parentRect.top);
                if (newHeight > minSize && newTop > 0) {
                    this.window.style.height = `${newHeight}px`;
                    this.window.style.top = `${newTop}px`;
                }
            },
            'bottom': () => {
                const newHeight = this.oldHeight + (clientY - this.oldMouseY);
                if (newHeight > minSize && newHeight < this.parentRect.bottom) {
                    this.window.style.height = `${newHeight}px`;
                }
            },
            'left': () => {
                const newWidth = this.oldWidth - (clientX - this.oldMouseX);
                if (newWidth > minSize && newWidth > this.parentRect.left) {
                    this.window.style.width = `${newWidth}px`;
                    this.window.style.left = `${newLeft}px`;
                }
            },
            'right': () => {
                const newWidth = this.oldWidth + (clientX - this.oldMouseX);
                if (newWidth > minSize && newWidth < this.parentRect.right) {
                    this.window.style.width = `${newWidth}px`;
                }
            }
        };

        resizeFunctions[this.anchorName](e);
    }
}