import { notFoundPageTemplate } from "./notFoundPageTemplate.js";
import BaseComponent from '../../framework/baseComponent.js';

export default class NotFoundPage extends BaseComponent {
  constructor({ render }) {
    super();
    this.render = render;
    this.showView = this._showView.bind(this);
  }

  _showView() {
    this.render(notFoundPageTemplate());
  }
}
