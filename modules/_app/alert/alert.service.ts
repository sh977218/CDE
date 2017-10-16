import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import { Subject } from "rxjs/Subject";

class Alert {
    type: string;
    message: string;
    id: number;

    constructor (_type: string, _message: string) {
        this.type = _type;
        this.message = _message;
        this.id = new Date().getTime();
    }
}

@Injectable()
export class AlertService {

    private  _alertSubject = new Subject<Alert>();
    public allAlerts: Alert[] = [];

    constructor() {
        let alertTime = (window as any).userAlertTime;
        this._alertSubject.subscribe(oneAlert => {
            this.allAlerts.push(oneAlert);
            if (alertTime > 1) setTimeout(() => this.remove(oneAlert.id), alertTime);
        });
    }

    public addAlert(type: string, message: string) {
        this._alertSubject.next(new Alert(type, message));
    }

    public remove (alertId: number) {
        this.allAlerts.forEach((a, i) => {
            if (a.id === alertId) {
                this.allAlerts.splice(i, 1);
            }
        });
    }

}