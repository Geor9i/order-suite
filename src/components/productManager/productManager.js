import { productManagerTemplate } from "./productManagerTemplate";


export default class ProductManager {
    constructor({ renderBody, router, fireService, utils }) {
        this.render = renderBody;
        this.router = router;
        this.fireService = fireService;
        this.stringUtil = utils.stringUtil;
        this.timeUtil = utils.timeUtil;
        this.dateUtil = utils.dateUtil;
        this.domUtil = utils.domUtil;
        this.showView = this._showView.bind(this);
        this.slideOpen = this._slideOpen.bind(this);
        this.sliderContainers = [];
    }

    _slideOpen(e) {
        const element = e.currentTarget;
        const id = element.dataset.id;
        const container = document.getElementById(id);
        const isRecorded = this.sliderContainers.some(
            (element) => element.id === id
        );
        if (!isRecorded) {
            this.sliderContainers.push(container);
        }

        let containerHierarchies = this.domUtil.getElementHierarchy(
            this.sliderContainers
        );
        const selectedHierarchy = containerHierarchies.find((arr) =>
            arr.find((element) => element.id === id)
        );
        const hierarchyHeightArr = selectedHierarchy.map(
            (el) => el.getBoundingClientRect().height
        );
        const startContainerIndex = selectedHierarchy.findIndex(
            (element) => element.id === id
        );
        const selectedContainer = selectedHierarchy[startContainerIndex];
        let containerHeight = hierarchyHeightArr[startContainerIndex];
        let toggleOpen = containerHeight <= 0 ? true : false;
        let cumulativeHeight = this.domUtil.getContentHeight(selectedContainer);
        selectedContainer.style.height = (toggleOpen ? cumulativeHeight : 0) + "px";
        for (let i = startContainerIndex - 1; i >= 0; i--) {
            if (selectedHierarchy[i].contains(selectedContainer)) {
                const currentParentContainer = selectedHierarchy[i];
                let currentParentContainerContentHeight = hierarchyHeightArr[i];
                cumulativeHeight = toggleOpen
                    ? cumulativeHeight + currentParentContainerContentHeight
                    : cumulativeHeight;
                currentParentContainer.style.height =
                    (toggleOpen
                        ? cumulativeHeight
                        : currentParentContainerContentHeight - cumulativeHeight) + "px";
            }
        }
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
        if (!this.fireService.user) {
            this.router.redirect("/");
            return;
        }
        const { records, products, rules } = this.getIventoryData();
        this.render(
            productManagerTemplate(this.slideOpen, records, products, rules)
        );
    }
}
