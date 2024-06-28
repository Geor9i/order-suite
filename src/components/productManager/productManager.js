import BaseComponent from "../../framework/baseComponent";
import { productManagerTemplate } from "./productManagerTemplate";
import styles from './productManager.module.scss';


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
        this.jsEvenUnsubscribeArr = [];
        this.isDraggin = false;
        this.dragElement = null;
        this.eventContainer = null;
    }

    init() {
        // this.jsEventBus.subscribe(this.jsEventBusSubscriberId, 'mousemove', (e) => console.log({x: e.clientX, y: e.clientY}))
        const subscription1 = this.jsEventBus.subscribe(this.jsEventBusSubscriberId, 'dragstart', this.dragStart.bind(this), {target: `.${styles['draggable']}`});
        const subscription2 = this.jsEventBus.subscribe(this.jsEventBusSubscriberId, 'dragover', this.dragOver.bind(this), { target: `.${styles['product-manager-container']}`});
        const subscription3 = this.jsEventBus.subscribe(this.jsEventBusSubscriberId, 'dragend', this.dragEnd.bind(this));
        this.jsEvenUnsubscribeArr.push(subscription1, subscription2, subscription3);
    }

    destroy() {
        this.jsEvenUnsubscribeArr.forEach(unsubscribe => unsubscribe());
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

    getIventoryData() {
        return {
            records: [
                {
                    name: 'Packaging',
                    dateFrom: '26/07/2023',
                    dateTo: '03/11/2023',
                    groups: 'Ambient Packaging, Chilled, Frozen',
                    products: [{
                        name: 'Carrier Bags',
                        group: 'Ambient Packaging',
                        status: 'Active',
                        rules: 'packaging',
                    },
                    {
                        name: 'Megabox',
                        group: 'Ambient Packaging',
                        status: 'Active',
                        rules: 'packaging',
                    }
                    ]
                },
                {
                    name: 'Frozen Goods',
                    dateFrom: '01/11/2023',
                    dateTo: '01/01/2024',
                    groups: 'Frozen',
                    products: [{
                        name: 'COB',
                        group: 'Frozen',
                        status: 'Active',
                        rules: 'frozen usage',
                    },
                    {
                        name: 'FTF Bites',
                        group: 'Frozen',
                        status: 'Disabled',
                        rules: 'frozen usage',
                    }
                    ]
                },
                {
                    name: 'Oil',
                    dateFrom: '01/01/2023',
                    dateTo: '01/01/2024',
                    groups: 'Oil',
                    products: [{
                        name: 'Oil',
                        group: 'Oil',
                        status: 'Active',
                        rules: 'Oil Usage',
                    }]
                }
            ],
            products: {
                oil: {
                    name: 'Oil',
                    group: 'Oil',
                    status: 'Active',
                    rules: 'oilusage',
                },
                cob: {
                    name: 'Chicken on the Bone',
                    group: 'Frozen',
                    status: 'Active',
                    rules: 'frozenusage',
                },
                ftfbites: {
                    name: 'FTF Bites',
                    group: 'Frozen',
                    status: 'Disabled',
                    rules: 'frozenusage',
                },
                carrierbags:{
                    name: 'Carrier Bags',
                    group: 'Ambient Packaging',
                    status: 'Active',
                    rules: 'packaging',
                },
                megabox: {
                    name: 'Megabox',
                    group: 'Ambient Packaging',
                    status: 'Active',
                    rules: 'packaging',
                }
            },
            rules:{
                frozenusage: {
                    name: 'Frozen Usage',
                    status: 'active',
                },
                packaging: {
                    name: 'Packaging',
                    status: 'active',
                },
                oilusage: {
                    name: 'Oil Usage',
                    status: 'active',
                },
            }
        }
    }

    _showView() {
        if (!this.authService.user) {
            this.router.redirect("/");
            return;
        }
        const { records, products, rules } = this.getIventoryData();
        this.render(
            productManagerTemplate(records, products, rules)
        );
    }

    
  dragStart(e) {
    this.eventContainer = document.querySelector(`.${styles['product-manager-container']}`);
    this.isDraggin = true;
    const { clientX, clientY } = e;
    const { rect: containerRect } = this.eventUtil.elementData(this.eventContainer);
    const { rect } = this.eventUtil.elementData(e.target);
    this.dragElement = e.target;
    this.dragOffsetX = clientX + containerRect.left - rect.left;
    this.dragOffsetY = clientY + containerRect.top - rect.top;
  }

  dragOver(e) {
    if (this.isDraggin) {
      const { clientX, clientY } = e;
      this.dragElement.style.left = clientX - this.dragOffsetX + 'px';
      this.dragElement.style.top = clientY - this.dragOffsetY + 'px';
    }
  }

  dragEnd(e) {
    this.isDraggin = false;
    this.dragElement = null;
  }
}
