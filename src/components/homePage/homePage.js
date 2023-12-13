export default class HomeComponent {
    constructor (templateFunction, renderHandler, router, utils) {
        this.renderHandler = renderHandler;
        this.templateFunction = templateFunction;
        this.router = router;
        this.showView = this._showView.bind(this);
    }

    _showView(ctx) {
        let template = this.templateFunction();
        this.renderHandler(template);
    }

  
}