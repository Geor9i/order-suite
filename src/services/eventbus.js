export class EventBus {
    constructor() {
        this.events = {};
    }


    on(eventType, subscriberId, callback) {
        if(this.events.hasOwnProperty(eventType)) {
            if (this.events[eventType].hasOwnProperty(subscriberId)) {
                this.events[eventType][subscriberId].push({callback});
            }else {
                this.events[eventType][subscriberId] = [{callback}];
            }
        } else {
            this.events[eventType] = {
                [subscriberId]: [{callback}]
            };
        }
        
        const subscribtionIndex = this.events[eventType][subscriberId].length - 1;
        return () => {
            this.events[eventType][subscriberId].splice(subscribtionIndex, 1);
        }
    }

    emit(eventType, data = null) {
        if (this.events.hasOwnProperty(eventType)) {
            Object.keys(this.events[eventType]).forEach(subscriberId  => {
                this.events[eventType][subscriberId].forEach(subscription => subscription.callback(data));
            })
        }
    }
}
