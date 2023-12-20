export default class ComponentManager {
    constructor() {
        this.currentComponent = null;
    }

    mount(component, baseLoader, ...otherLoaders) {
        if (this.currentComponent) {
            this.unmount()
        }
        const loadersObj = otherLoaders.reduce((acc, curr) => acc = {...acc, ...curr}, {})
        const loader = {...baseLoader, ...loadersObj}
        this.currentComponent = new component(loader)
        return this.currentComponent.showView()
    }

    unmount() {
        this.currentComponent = null;
    }
}