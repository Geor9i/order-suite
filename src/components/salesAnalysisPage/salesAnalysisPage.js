import { salesAnaylsisPageTemplate } from './salesAnalysisPageTemplate';


export default class SalesAnalysis {
    constructor({ renderBody, router, fireService, utils }) {
        this.render = renderBody;
        this.router = router;
        this.fireService = fireService;
        this.stringUtil = utils.stringUtil;
        this.dateUtil = utils.dateUtil;
        this.domUtil = utils.domUtil;
        this.showView = this._showView.bind(this);
        this.sliderContainers = [];
    }


    _showView() {
        if (!this.fireService.user) {
            this.router.redirect("/");
            return;
        }

        this.render(
            salesAnaylsisPageTemplate()
        );
    }
}