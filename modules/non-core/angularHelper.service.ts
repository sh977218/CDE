import { Injectable } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { Observer } from 'rxjs';

@Injectable()
export class AngularHelperService {
    constructor(private alert: AlertService) {
    }

    httpClientObserver<T>(next: (t: T) => void): Observer<T> {
        return {next, error: err => this.alert.httpErrorAlert(err), complete: () => {}}
    }
}
