import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComponentType } from '@angular/cdk/overlay';
import { UserService } from '_app/user.service';
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

@Injectable({ providedIn: 'root' })
export class AlertService {
    alertTime = 90000;

    constructor(private snackBar: MatSnackBar, private userService: UserService) {}

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

    httpErrorAlert(err: HttpErrorResponse, info = '') {
        if (err.status === 401) {
            this.userService.reload().then();
        }
        this.addAlert('error', (info ? info + ' ' : '') + httpErrorMessage(err));
    }
}
