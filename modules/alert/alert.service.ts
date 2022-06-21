import { HttpErrorResponse } from '@angular/common/http';
import { forwardRef, Inject, Injectable } from '@angular/core';
import { httpErrorMessage } from 'non-core/angularHelper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComponentType } from '@angular/cdk/overlay';

export class Alert {
    id: number;
    message: string;
    type: string;
    expired = false;

    constructor(_type: string, _message: string) {
        this.type = _type;
        this.message = _message;
        this.id = new Date().getTime();
    }

}

@Injectable()
export class AlertService {
    alertTime = 90000;

    constructor(private snackBar: MatSnackBar) {
    }

    addAlert(type: string, message: string) {
        let config = {duration: this.alertTime};
        if (type === 'danger') {
            config = {duration: 0};
        }
        this.snackBar.open(message, 'Dismiss', config);
    }

    addAlertFromComponent<T>(type: string, component: ComponentType<T>, data: any) {
        let config = {duration: this.alertTime};
        if (type === 'danger') {
            config = {duration: 0};
        }
        this.snackBar.openFromComponent(component, {
            ...config,
            data
        });
    }

    httpErrorMessageAlert(err: HttpErrorResponse, info = '') {
        const message = (info ? info + ' ' : '') + httpErrorMessage(err);
        this.snackBar.open(message, 'Dismiss', {duration: this.alertTime});
        console.error(message);
    }
}
