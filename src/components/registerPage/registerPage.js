export default class RegisterPage {
  constructor(registerPageTemplate, render, router, fireService, utils) {
    this.registerPageTemplate = registerPageTemplate;
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
    
    this.render(this.registerPageTemplate(this.submitHandler));
  }

  _submitHandler(e) {
    e.preventDefault();
    const formData = this.formUtil.getFormData(e.currentTarget);
    if (this.formUtil.formValidator(formData, 6, "repeatPassword")) {
      const { email, password } = formData;
      try {
          this.fireService.register(email, password);
          this.router.navigate('/')
      } catch(err) {
        console.log(err);
      }
    }
  }
}
