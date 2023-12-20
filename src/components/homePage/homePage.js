import { homePageTemplate } from "./homePageTemplate.js";

export default class HomeComponent {
  constructor({ renderBody, router, utils }) {
    this.renderHandler = renderBody;
    this.router = router;
    this.showView = this._showView.bind(this);
  }

  _showView(ctx) {
    this.renderHandler(homePageTemplate());
  }
}
