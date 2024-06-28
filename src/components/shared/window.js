import { serviceProvider } from "../../services/serviceProvider.js";
import styles from './window.scss';
import { utils } from "../../utils/utilConfig.js";

export default class Window {
    constructor(parent) {
        this.jsEventBusSubscriberId = `${Math.random() * 1000000}`;
        this.parent = parent;
        this.eventUtil = utils.eventUtil;
        this.jsEventBus = serviceProvider.jsEventBus;
        this.jsEvenUnsubscribeArr = [];
        this.isDraggin = false;
        this.anchor = null;
        this.anchorName = null;
        this.anchors = {};
        this.window = null;
        this.parentRect = null;
    }

    init() {
        const subscription1 = this.jsEventBus.subscribe(this.jsEventBusSubscriberId, 'mousedown', this.dragStart.bind(this), {target: this.window});
        const subscription2 = this.jsEventBus.subscribe(this.jsEventBusSubscriberId, 'mousemove', this.dragOver.bind(this));
        const subscription3 = this.jsEventBus.subscribe(this.jsEventBusSubscriberId, 'mouseup', this.dragEnd.bind(this));
        this.jsEvenUnsubscribeArr.push(subscription1, subscription2, subscription3);
    }
    destroy() {
        this.jsEvenUnsubscribeArr.forEach(unsubscribe => unsubscribe());
        this.anchors?.window.remove();
    }

    showView() {
        this.buildWindow();
        this.init();
    }

    buildWindow() {
        const window = document.createElement('div');
        this.window = window;
        window.classList.add(styles['window']);
        const fragment = document.createDocumentFragment();
        const edges = ['top', 'right', 'bottom', 'left'];
        edges.map(name => {
            const edge = document.createElement('div');
            this.anchors[name] = edge;
            edge.classList.add(styles['edge'], styles[name]);
            fragment.appendChild(edge);
        })
        const vertex = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        vertex.map(name => {
            const vertex = document.createElement('div');
            this.anchors[name] = vertex;
            vertex.classList.add(styles['vertex'], styles[name]);
            fragment.appendChild(vertex);
        })
        window.appendChild(fragment);
        this.parent.appendChild(window);
    }

    dragStart(e) {
        this.isDraggin = true;
        const { clientX, clientY } = e;
        const { rect } = this.eventUtil.elementData(e.target);
        this.parentRect = this.eventUtil.elementData(this.parent).rect;
        if (e.target !== this.window) {
            this.anchorName = Object.keys(this.anchors).find(name => this.anchors[name] === e.target);
            this.anchor = e.target;
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