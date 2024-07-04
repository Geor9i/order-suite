import ErrorDisplay from "../components/errorDisplay/errorDisplay.js";

export default class ErrorRelay {
    constructor() {
        this.errorDisplay = new ErrorDisplay();
    }

    send(...errors) {
        this.errorDisplay.push(...errors);
        this.errorDisplay.render();
    }
}