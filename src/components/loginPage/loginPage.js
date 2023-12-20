import { loginPageTemplate } from "./loginPageTemplate.js";

export default class LoginPage {
  constructor({ renderBody, router, fireService, utils }) {
    this.render = renderBody;
    this.router = router;
    this.fireService = fireService;
    this.formUtil = utils.formUtil;
    this.showView = this._showView.bind(this);
    this.submitHandler = this._submitHandler.bind(this);
  }

  _showView(ctx) {
    if (this.fireService.user) {
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
        await this.fireService.login(email, password);
        this.router.redirect("/");
      } catch (err) {
        console.log(err);
      }
    }
  }
}
