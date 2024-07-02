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
        this.events = {};
        this.minimizeLocation = {x: 535, y: 893};
        this.create();
        return {
            window: this.window,
            content: this.window.querySelector(`.${styles['content']}`)
        }
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

    create() {
        this.buildWindow();
        this.init();
    }

    buildWindow() {
        const window = document.createElement('div');
        window.classList.add(styles['window'], styles['draggable']);
        this.parent.appendChild(window);
        const controls = {
            close: this.closeWindow.bind(this),
            maximize: this.maximizeWindow.bind(this),
            minimize: this.minimizeWindow.bind(this)
        }
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
    minimizeWindow() {
            const { rect: windowRect } = this.eventUtil.elementData(this.window);
            const { rect: parentRect } = this.eventUtil.elementData(this.parent);
            this.windowState = windowRect;
            const startOpacity = 1;
            const startX = windowRect.left - parentRect.left;
            const startY = windowRect.top - parentRect.top;
            const startWidth = windowRect.width;
            const startHeight = windowRect.height;
            const endWidth = 300;
            const endHeight = 300;
            const endX = this.minimizeLocation.x;
            const endY = this.minimizeLocation.y;
            const duration = 300; 
            const startTime = performance.now();
      
            function easeInOutQuad(t) {
              return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            }
      
            const animate = (time) => {
              const elapsedTime = time - startTime;
              const progress = Math.min(elapsedTime / duration, 1);
              const easedProgress = easeInOutQuad(progress);
              const currentX = startX + (endX - startX) * easedProgress;
              const currentY = startY + (endY - startY) * easedProgress;
              const currentWidth = startWidth + (endWidth - startWidth) * easedProgress;
              const currentHeight = startHeight + (endHeight - startHeight) * easedProgress;
              const currentOpacity = startOpacity * (1 - easedProgress);
              this.window.style.left = `${currentX}px`;
              this.window.style.top = `${currentY}px`;
              this.window.style.width = `${currentWidth}px`;
              this.window.style.height = `${currentHeight}px`;
              this.window.style.opacity = `${currentOpacity}`;
      
              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                this.emit('windowMinimized');
              }
            }
            requestAnimationFrame(animate);
}

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