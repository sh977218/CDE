import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { httpErrorMessage } from 'non-core/angularHelper';

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

    constructor(private snackBar: MatSnackBar) {
        this.alertTime = (window as any).userAlertTime;
        if (this.alertTime === 1) this.alertTime = 90000;
    }

    addAlert(type: string, message: string) {
        this.snackBar.open(message, 'Dismiss', {duration: this.alertTime});
    }

    httpErrorMessageAlert(err: HttpErrorResponse, info = '') {
        const message = (info ? info + ' ' : '') + httpErrorMessage(err);
        this.snackBar.open(message, 'Dismiss', {duration: this.alertTime});
        console.error(message);
    }
}
