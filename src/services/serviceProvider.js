import AuthService from "./authService.js";
import { EventBus } from "./eventbus.js";
import FirestoreService from "./firestoreService.js";
import { JSEventManagerService } from "./jsEventManager.js";
import { JSEventBusService } from "./jseventBus.js";
import { app } from '../config/firebaseConfig.js';
import Harvester from "./harvester.js";
import ErrorRelay from "./errorRelay.js";
import Processor from "./processor.js";

class ServiceProvider {
    constructor() {
        this.eventBus = new EventBus();
        this.authService = new AuthService(app, this.eventBus);
        this.firestoreService = new FirestoreService(app, this.eventBus);
        this.jsEventBus = new JSEventBusService();
        this.jsEventManagerService = new JSEventManagerService(this.jsEventBus);
        this.harvester = new Harvester();
        this.errorRelay = new ErrorRelay();
        this.processor = new Processor();
    }
}

export const serviceProvider = new ServiceProvider();