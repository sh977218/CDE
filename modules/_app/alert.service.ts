import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
import { AngularHelperService } from 'widget/angularHelper.service';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from "@angular/material";

export class Alert {
    id: number;
    message: string;
    type: string;
    expired: Boolean;

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
    currentSnack: MatSnackBarRef<SimpleSnackBar>;
    alertTime: number;

    constructor(private snackBar: MatSnackBar) {
        this.alertTime = (window as any).userAlertTime;
        if (this.alertTime === 0) this.alertTime = 10000;
    }

    addAlert(type: string, message: string) {
        this.currentSnack = this.snackBar.open(message, "Dismiss", {duration: this.alertTime});
    }

    httpErrorMessageAlert(err, info: string = '') {
        let errorMessage = AngularHelperService.httpErrorMessage(err);
        this.currentSnack = this.snackBar.open(info ? info + ' ' + errorMessage : errorMessage, "Dismiss",
            {duration: this.alertTime});
    }

}
