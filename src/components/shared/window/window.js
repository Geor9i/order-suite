import { serviceProvider } from "../../../services/serviceProvider.js";
import styles from './window.scss';
import { utils } from "../../../utils/utilConfig.js";
import { render } from "lit-html";
import { windowTemplate } from "./windowTemplate.js";

export default class Window {
    constructor(parent, title) {
        this._isActive = false;
        this.title = title;
        this.jsEventBusSubscriberId = `Window_${Math.random() * 1000000}`;
        this.parent = parent;
        this.eventUtil = utils.eventUtil;
        this.jsEventBus = serviceProvider.jsEventBus;
        this.jsEvenUnsubscribeArr = [];
        this.isDraggin = false;
        this.anchor = null;
        this.anchorName = null;
        this.element = null;
        this.parentRect = null;
        this.windowState = {};
        this.isMaximized = false;
        this.events = {};
        this.minimizeTransition = null;
        this.program = null;
        this.create();
        this.contentContainer = this.element.querySelector(`.${styles['content']}`);
    }

    init() {
        const subscription1 = this.jsEventBus.subscribe(this.jsEventBusSubscriberId, 'mousedown', this.dragStart.bind(this), {target: this.element});
        const subscription2 = this.jsEventBus.subscribe(this.jsEventBusSubscriberId, 'mousemove', this.dragOver.bind(this));
        const subscription3 = this.jsEventBus.subscribe(this.jsEventBusSubscriberId, 'mouseup', this.dragEnd.bind(this));
        const subscription4 = this.on('maximizeWindow', 'window', this.minimizeWindow.bind(this, true));
        this.jsEvenUnsubscribeArr.push(subscription1, subscription2, subscription3, subscription4);
    }
    destroy() {
        this.jsEvenUnsubscribeArr.forEach(unsubscribe => unsubscribe());
        this.element.remove();
    }

    boot(Program) {
        this.program = new Program();
        this.program.render(this.contentContainer);
    }

    create() {
        this.buildWindow();
        this.init();
    }
    setActive(active = true) {this.element.style.zIndex = active ?'10' : '1'}

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
        this.element = window;
    }

    closeWindow() {
        this.program && this.program.close();
        this.destroy()
        this.emit('closeWindow');
    };
    maximizeWindow() {
        const button = document.querySelector(`.${styles['maximize']}`);
        const i = button.querySelector('i');
        if (this.isMaximized) {
            this.element.style.top = `${this.windowState.top}px`;
            this.element.style.left = `${this.windowState.left}px`;
            this.element.style.height = `${this.windowState.height}px`;
            this.element.style.width = `${this.windowState.width}px`;
            this.isMaximized = false;
            i.className = 'fa-solid fa-up-right-and-down-left-from-center';
        } else {
            this.windowState = this.eventUtil.elementData(this.element).rect;
            const { rect } = this.eventUtil.elementData(this.parent);
            this.element.style.top = `${0}px`;
            this.element.style.left = `${0}px`;
            this.element.style.height = `${rect.height}px`;
            this.element.style.width = `${rect.width}px`;
            this.isMaximized = true;
            i.className = 'fa-solid fa-down-left-and-up-right-to-center';
        }
    };
    minimizeWindow(open = false) {
            !open && this.emit('minimizeTarget');
            const windowRect = this.eventUtil.elementData(this.element).rect;
            const { rect: parentRect } = this.eventUtil.elementData(this.parent);
         
            const startOpacity = open ? 0 : 1;
            const startX = windowRect.left - parentRect.left;
            const startY = windowRect.top - parentRect.top;
            const startWidth = windowRect.width;
            const startHeight = windowRect.height;
            const endWidth = open ? this.windowState.width : Math.max(this.minimizeTransition.width, 200);
            const endHeight = open ? this.windowState.height : Math.max(this.minimizeTransition.height, 200);;
            const endX = open ? this.windowState.left : this.minimizeTransition.left;
            const endY = open ? this.windowState.top : this.minimizeTransition.top;
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
              const currentOpacity = open ? startOpacity + easedProgress : startOpacity * (1 - easedProgress);
              this.element.style.left = `${currentX}px`;
              this.element.style.top = `${currentY}px`;
              this.element.style.width = `${currentWidth}px`;
              this.element.style.height = `${currentHeight}px`;
              this.element.style.opacity = `${currentOpacity}`;
      
              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                this.windowState = {
                    ...windowRect,
                    left: startX,
                    top: startY
                };
                !open && this.emit('windowMinimized');
              }
            }
            requestAnimationFrame(animate);
}

    dragStart(e) {
        let draggable = e.target;
        if (!e.target.classList.contains(styles['draggable'])) {
            draggable = this.element;
        }
        this.isDraggin = true;
        const { clientX, clientY } = e;
        const { rect } = this.eventUtil.elementData(draggable);
        this.parentRect = this.eventUtil.elementData(this.parent).rect;
        if (e.target.classList.contains(styles['edge']) || e.target.classList.contains(styles['vertex'])) {
            this.anchor = draggable;
            this.anchorName = draggable.dataset.id;
        }
        const { rect: windowRect } = this.eventUtil.elementData(this.element);
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
              this.element.style.top = `${offsetY}px`;
            }
            if (offsetX > 0 && offsetX < this.parentRect.width - this.windowRect.width) {
                this.element.style.left = `${offsetX}px`;
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
                    this.element.style.width = `${newWidth}px`;
                    this.element.style.left = `${newLeft}px`;
                }
                const newHeight = this.oldHeight - (clientY - this.oldMouseY);
                if (newHeight > minSize && newTop > 0) {
                    this.element.style.height = `${newHeight}px`;
                    this.element.style.top = `${newTop}px`;
                }
            },
            'top-right': () => {
                const newWidth = this.oldWidth + (clientX - this.oldMouseX);
                if (newWidth > minSize && newWidth < this.parentRect.right) {
                    this.element.style.width = `${newWidth}px`;
                }
                const newHeight = this.oldHeight - (clientY - this.oldMouseY);
                if (newHeight > minSize && newTop > 0) {
                    this.element.style.height = `${newHeight}px`;
                    this.element.style.top = `${newTop}px`;
                }
            },
            'bottom-left': () => {
                const newHeight = this.oldHeight + (clientY - this.oldMouseY);
                if (newHeight > minSize && newHeight < this.parentRect.bottom) {
                    this.element.style.height = `${newHeight}px`;
                }
                const newWidth = this.oldWidth - (clientX - this.oldMouseX);
                if (newWidth > minSize && newHeight < this.parentRect.bottom) {
                    this.element.style.width = `${newWidth}px`;
                    this.element.style.left = `${newLeft}px`;
                }
            },
            'bottom-right': () => {
                const newWidth = this.oldWidth + (clientX - this.oldMouseX);
                if (newWidth > minSize && newWidth < this.parentRect.right) {
                    this.element.style.width = `${newWidth}px`;
                }
                const newHeight = this.oldHeight + (clientY - this.oldMouseY);
                if (newHeight > minSize && newHeight < this.parentRect.bottom) {
                    this.element.style.height = `${newHeight}px`;
                }
            },
            'top': () => {
                const newHeight = this.oldHeight - (clientY - this.oldMouseY);
                console.log(this.parentRect.top);
                if (newHeight > minSize && newTop > 0) {
                    this.element.style.height = `${newHeight}px`;
                    this.element.style.top = `${newTop}px`;
                }
            },
            'bottom': () => {
                const newHeight = this.oldHeight + (clientY - this.oldMouseY);
                if (newHeight > minSize && newHeight < this.parentRect.bottom) {
                    this.element.style.height = `${newHeight}px`;
                }
            },
            'left': () => {
                const newWidth = this.oldWidth - (clientX - this.oldMouseX);
                if (newWidth > minSize && newWidth > this.parentRect.left) {
                    this.element.style.width = `${newWidth}px`;
                    this.element.style.left = `${newLeft}px`;
                }
            },
            'right': () => {
                const newWidth = this.oldWidth + (clientX - this.oldMouseX);
                if (newWidth > minSize && newWidth < this.parentRect.right) {
                    this.element.style.width = `${newWidth}px`;
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