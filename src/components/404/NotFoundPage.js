import { notFoundPageTemplate } from "./notFoundPageTemplate.js";

export default class NotFoundPage {
  constructor({ render }) {
    this.render = render;
    this.showView = this._showView.bind(this);
  }

  _showView() {
    this.render(notFoundPageTemplate());
  }
}
