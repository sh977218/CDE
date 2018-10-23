import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material';

import { httpErrorMessage } from 'widget/angularHelper';

export class Alert {
    id: number;
    message: string;
    type: string;
    expired = false;

    constructor (_type: string, _message: string) {
        this.type = _type;
        this.message = _message;
        this.id = new Date().getTime();
    }

    setMessage(msg: string) {
        this.message = msg;
    }
}

@Injectable()
export class AlertService {
    alertTime: number;
    currentSnack?: MatSnackBarRef<SimpleSnackBar>;

    constructor(private snackBar: MatSnackBar) {
        this.alertTime = (window as any).userAlertTime;
        if (this.alertTime === 1) this.alertTime = 90000;
    }

    addAlert(type: string, message: string) {
        this.currentSnack = this.snackBar.open(message, "Dismiss", {duration: this.alertTime});
    }

    httpErrorMessageAlert(err: any, info = '') {
        let errorMessage = httpErrorMessage(err);
        this.currentSnack = this.snackBar.open(info ? info + ' ' + errorMessage : errorMessage, "Dismiss",
            {duration: this.alertTime});
    }
}
