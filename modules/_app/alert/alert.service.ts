import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
import { AngularHelperService } from 'widget/angularHelper.service';


class Alert {
    id: number;
    message: string;
    type: string;

    constructor (_type: string, _message: string) {
        this.type = _type;
        this.message = _message;
        this.id = new Date().getTime();
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
            if (alertTime > 1) setTimeout(() => this.remove(oneAlert.id), alertTime);
        });
    }

    addAlert(type: string, message: string) {
        this._alertSubject.next(new Alert(type, message));
    }

    httpErrorMessageAlert(err, info: string = '') {
        let errorMessage = AngularHelperService.httpErrorMessage(err);
        this.addAlert('danger', info ? info + ' ' + errorMessage : errorMessage);
    }

    remove (alertId: number) {
        this.allAlerts.forEach((a, i) => {
            if (a.id === alertId) {
                this.allAlerts.splice(i, 1);
            }
        });
    }
}
