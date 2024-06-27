import { db } from "../../constants/db.js";
import { registerPageTemplate } from "./registerPageTemplate.js";
import { registerUserData } from "../../constants/registerUserData.js";
import BaseComponent from "../../framework/baseComponent.js";
import { routes } from "../../constants/routing.js";

export default class RegisterPage extends BaseComponent {
  constructor({ renderBody, router, services, utils }) {
    super();
    this.render = renderBody;
    this.router = router;
    this.authService = services.authService;
    this.firestoreService = services.firestoreService;
    this.formUtil = utils.formUtil;
    this.showView = this._showView.bind(this);
    this.submitHandler = this._submitHandler.bind(this);
  }

  _showView(ctx) {
    if (this.authService.user) {
      this.router.redirect(routes.HOME);
      return;
    }

    this.render(registerPageTemplate(this.submitHandler));
  }

  async _submitHandler(e) {
    e.preventDefault();
    const formData = this.formUtil.getFormData(e.currentTarget);
    if (this.formUtil.formValidator(formData, 6, "repeatPassword")) {
      const { email, password, storeName } = formData;
      try {
        await this.authService.register(email, password);
        await this.firestoreService.setDoc(db.USERS, {...registerUserData, STORE_NAME: storeName }, { merge: true })
        this.router.redirect(routes.HOME);
      } catch (err) {
        console.log(err);
      }
    }
  }
}
