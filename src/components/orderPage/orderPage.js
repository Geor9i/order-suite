import BaseComponent from "../../framework/baseComponent.js";
import { orderPageTemplate } from "./orderPageTemplate.js";

export default class OrderPage extends BaseComponent {
  constructor({ renderBody, router, services, utils }) {
    super();
    this.stringUtil = utils.stringUtil;
    this.dateUtil = utils.dateUtil;
    this.domUtil = utils.domUtil;
    this.renderHandler = renderBody;
    this.router = router;
    this.authService = services.authService;
    this.processor = services.processor;
    this.valueButtonClick = this._valueButtonClick.bind(this);
    this.searchHandler = this._searchHandler.bind(this);
    this.deleteHandler = this._deleteHandler.bind(this);
    this.resetHandler = this._resetHandler.bind(this);
    this.copyRMFScript = this._copyRMFScript.bind(this);
    this.showView = this._showView.bind(this);
  }

  _showView(ctx) {
    if (!this.authService.user) {
      this.router.redirect("/");
      return;
    }

    let template = orderPageTemplate(
      this.getHeaderData(),
      this.processor.orderProducts,
      this.searchHandler,
      this.valueButtonClick,
      this.deleteHandler,
      this.resetHandler,
      this.copyRMFScript
    );
    this.renderHandler(template);
  }

  _valueButtonClick(e) {
    const element = e.currentTarget;
    const button = element.id.split("-")[1];
    const productId = element.dataset.id;
    const product = this.processor.orderProducts[productId];
    product.order =
      button === "plus" ? product.order + 1 : Math.max(0, product.order - 1);
    this.showView();
  }

  _deleteHandler(e) {
    const productId = e.currentTarget.dataset.id;
    const product = this.processor.orderProducts[productId];
    product.order = 0;
    this.showView();
  }

  _searchHandler(e) {
    const value = e.currentTarget.value
      .toLowerCase()
      .split(" ")
      .filter((el) => el !== " ")
      .join("");
    for (let productId in this.processor.orderProducts) {
      if (productId.includes(value) || value === "") {
        this.processor.orderProducts[productId].sideDisplay = true;
      } else {
        this.processor.orderProducts[productId].sideDisplay = false;
      }
    }
    this.showView();
  }

  _copyRMFScript() {
    let productList = "";
    for (let productId in this.processor.orderProducts) {
      // const graphSize = usageGraph[productId].size;
      const product = this.processor.orderProducts[productId];
      productList += `${productId}:${product.order}\n`;
    }

    let rmfRelayScript = `let productData = \`${productList}\`;
    
      tableElement = document.querySelectorAll("#ctl00_ph_otd_geo_ctl00 tbody tr")
      productData = productData.split(\`\\n\`).filter(el => el.length > 1);
      let products = {};
      
      for (let entry of productData) {
          let [product, value] = entry.split(":");
          value = Number(value);
          products[product] = value;
      }
      
      for (let row = 1; row < tableElement.length; row++) {
          let productElement = tableElement[row].cells[1].innerText;
          let productEl = tableElement[row].cells[1];
          let inputElement = tableElement[row].cells[3].firstElementChild;
          let rowIncomingDate  = tableElement[row].children[14].children[0];
          if (products.hasOwnProperty(productElement)) {
            let value = products[productElement];
            if (value > 0) {
              inputElement.value = value;
              inputElement.style.backgroundColor = "#d8ffa6";
            }
            productEl.style.fontWeight = "bold";
            productEl.style.borderRadius = "13px";
            productEl.style.border = "3px solid black";
            delete products[productElement];
          }
      }`;

    navigator.clipboard
      .writeText(rmfRelayScript)
      .then(() => {
        alert("Script armed and ready!");
      })
      .catch((error) => {
        console.error("Unable to copy variable data:", error);
      });
  }

  _resetHandler() {
    for (let productId in this.processor.orderProducts) {
      this.processor.orderProducts[productId].order =
        this.processor.orderProducts[productId].forecastOrder;
    }
    this.showView();
  }

  getHeaderData() {
    const months = this.dateUtil.getMonths([]);
    const weekdays = this.dateUtil.getWeekdays([]);
    return {
      invoiceDay: {
        weekday: this.stringUtil.toPascalCase(
          weekdays[this.processor.deliveryDate.getDay() - 1]
        ),
        date: `${this.processor.deliveryDate.getDate()} - ${
          months[this.processor.deliveryDate.getMonth()]
        }`,
      },
      nextInvoiceDay: {
        weekday: this.stringUtil.toPascalCase(
          weekdays[this.processor.nextOrderDeliveryDate.getDay() - 1]
        ),
        date: `${this.processor.nextOrderDeliveryDate.getDate()} - ${
          months[this.processor.nextOrderDeliveryDate.getMonth()]
        }`,
      },
    };
  }
}
