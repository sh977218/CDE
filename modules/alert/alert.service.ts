import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComponentType } from '@angular/cdk/overlay';
import { httpErrorMessage } from 'non-core/angularHelper';

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

    constructor(private snackBar: MatSnackBar) {}

    addAlert(type: string, message: string) {
        const config = { duration: type === 'danger' ? 0 : this.alertTime };
        this.snackBar.open(message, 'Dismiss', config);
    }

    addAlertFromComponent<T>(type: string, component: ComponentType<T>, data: any) {
        const config = { duration: type === 'danger' ? 0 : this.alertTime };
        this.snackBar.openFromComponent(component, {
            ...config,
            data,
        });
    }

    httpErrorMessageAlert(err: HttpErrorResponse, info = '') {
        const message = (info ? info + ' ' : '') + httpErrorMessage(err);
        this.snackBar.open(message, 'Dismiss', { duration: this.alertTime });
    }
}
