export default class OrderPage {
    constructor(utility, renderHandler, templateFunction, router) {
        this.utility = utility;
        this.renderHandler = renderHandler;
        this.templateFunction = templateFunction;
        this.router = router;
        this.showView = this._showView.bind(this)
    }

    _showView() {
        let template = this.templateFunction();
        this.renderHandler(template);
    }

}