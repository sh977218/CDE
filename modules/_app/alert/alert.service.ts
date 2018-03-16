import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
import { AngularHelperService } from 'widget/angularHelper.service';

export class Alert {
    id: number;
    message: string;
    type: string;
    expired: Boolean;
    persistant: Boolean;

    constructor (_type: string, _message: string) {
        this.type = _type;
        this.message = _message;
        this.id = new Date().getTime();
    }

    public setMessage(msg) {
        this.message = msg;
    }
}

@Injectable()
export class AlertService {
    private  _alertSubject = new Subject<Alert>();
    allAlerts: Alert[] = [];

    constructor() {
        let alertTime = (window as any).userAlertTime;
        this._alertSubject.subscribe(oneAlert => {
            this.allAlerts.push(oneAlert);
            let timeoutFunc = () => {
                if (oneAlert.persistant) {
                    setTimeout(timeoutFunc, alertTime);
                } else this.remove(oneAlert.id);
            };
            if (alertTime > 1) {
                setTimeout(timeoutFunc, alertTime);
            }
        });
    }

    addAlert(type: string, message: string) {
        const newAlert = new Alert(type, message);
        this._alertSubject.next(newAlert);
        return newAlert;
    }

    httpErrorMessageAlert(err, info: string = '') {
        let errorMessage = AngularHelperService.httpErrorMessage(err);
        this.addAlert('danger', info ? info + ' ' + errorMessage : errorMessage);
    }

    remove (alertId: number) {
        this.allAlerts.forEach((a, i) => {
            if (a.id === alertId) {
                this.allAlerts[i].expired = true;
                this.allAlerts.splice(i, 1);
            }
        });
    }
}
