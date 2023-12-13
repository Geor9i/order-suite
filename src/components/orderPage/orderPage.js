export default class OrderPage {
  constructor(templateFunction, renderHandler, router, processor, utils) {
    this.stringUtil = utils.stringUtil;
    this.dateUtil = utils.dateUtil;
    this.renderHandler = renderHandler;
    this.templateFunction = templateFunction;
    this.router = router;
    this.processor = processor;
    this.showView = this._showView.bind(this);
  }

  _showView() {
    const weekdays = this.dateUtil.getWeekdays([]);
    const headerData = {
      invoiceDay: this.stringUtil.toPascalCase(weekdays[this.processor.orderInvoiceDate.getDay() - 1]).slice(0,3),
      nextInvoiceDay: this.stringUtil.toPascalCase(weekdays[this.processor.nextOrderInvoiceDate.getDay() - 1]).slice(0,3),
    };
    console.log(this.processor.currentOrderProducts);
    let template = this.templateFunction(headerData, this.processor.currentOrderProducts);
    this.renderHandler(template);
  }
}
