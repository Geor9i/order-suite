export class NavComponent {
    constructor (utility, renderHandler, templateFunction, router) {
        this.utility = utility;
        this.renderHandler = renderHandler;
        this.templateFunction = templateFunction;
        this.router = router;
        this.showView = this._showView.bind(this);
        this.navDropdown = this._navDropdown.bind(this);
    }

    _showView(ctx, next) {
        let template = this.templateFunction(this.navDropdown);
        this.renderHandler(template);
        next();
    }

    _navDropdown() {

        const dropdownMenuElementStates = {
            normal : document.querySelector('.dropdown__menu'),
            dropped : document.querySelector('.dropdown__menu__active'),
        }

        let dropDownElement = this.utility.findActiveClass(dropdownMenuElementStates);
            this.utility.toggleClass(dropDownElement, ['dropdown__menu', 'dropdown__menu__active'])
        }
  
}