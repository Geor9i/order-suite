export default class LoginPage {
  constructor(loginPageTemplate, render, router, fireService, utils) {
    this.loginPageTemplate = loginPageTemplate;
    this.render = render;
    this.router = router;
    this.fireService = fireService;
    this.formUtil = utils.formUtil;
    this.showView = this._showView.bind(this);
    this.submitHandler = this._submitHandler.bind(this);
  }

  _showView(ctx) {
    if (ctx.user) {
      this.router.navigate("/");
      return;
    }

    this.render(this.loginPageTemplate(this.submitHandler));
  }

  _submitHandler(e) {
    e.preventDefault();
    const formData = this.formUtil.getFormData(e.currentTarget);
    if (this.formUtil.formValidator(formData, 6)) {
      const { email, password } = formData;
      try {
        this.fireService.login(email, password);
        this.router.navigate("/");
      } catch (err) {
        console.log(err);
      }
    }
  }
}
