import { registerPageTemplate } from "./registerPageTemplate.js";

export default class RegisterPage {
  constructor({ renderBody, router, authService, firestoreService, utils }) {
    this.render = renderBody;
    this.router = router;
    this.authService = authService;
    this.firestoreService = firestoreService;
    this.formUtil = utils.formUtil;
    this.showView = this._showView.bind(this);
    this.submitHandler = this._submitHandler.bind(this);
  }

  _showView(ctx) {
    if (this.authService.user) {
      this.router.redirect("/");
      return;
    }

    this.render(registerPageTemplate(this.submitHandler));
  }

  async _submitHandler(e) {
    e.preventDefault();
    const formData = this.formUtil.getFormData(e.currentTarget);
    if (this.formUtil.formValidator(formData, 6, "repeatPassword")) {
      const { email, password } = formData;
      try {
        await this.authService.register(email, password);
        this.router.redirect("/");
      } catch (err) {
        console.log(err);
      }
    }
  }
}
