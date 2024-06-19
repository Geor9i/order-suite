import BaseComponent from "../../framework/baseComponent.js";
import { loginPageTemplate } from "./loginPageTemplate.js";

export default class LoginPage extends BaseComponent {
  constructor({ renderBody, router, authService, utils }) {
    this.render = renderBody;
    this.router = router;
    this.authService = authService;
    this.formUtil = utils.formUtil;
    this.showView = this._showView.bind(this);
    this.submitHandler = this._submitHandler.bind(this);
  }

  _showView(ctx) {
    if (this.authService.user) {
      this.router.redirect("/");
      return;
    }

    this.render(loginPageTemplate(this.submitHandler));
  }

  async _submitHandler(e) {
    e.preventDefault();
    const formData = this.formUtil.getFormData(e.currentTarget);
    if (this.formUtil.formValidator(formData, 6)) {
      const { email, password } = formData;
      try {
        await this.authService.login(email, password);
        this.router.redirect("/");
      } catch (err) {
        console.log(err);
      }
    }
  }
}
