import { forwardRef, Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class NotificationService {
    show = false;
    numberOfNotifications = 0;
    serverErrorNumber = 0;
    clientErrorNumber = 0;

    constructor(@Inject(forwardRef(() => HttpClient)) public http: HttpClient) {
    }

    toggle() {
        this.show = !this.show;
    }

    updateErrorNumber(){
        this.http.get('/server/log/serverErrorsNumber').subscribe((res: any) => {
            this.serverErrorNumber = res.count;
            if (res.count) {
                this.numberOfNotifications++;
            }
        });
        this.http.get('/server/log/clientErrorsNumber').subscribe((res: any) => {
            this.clientErrorNumber = res.count;
            if (res.count) {
                this.numberOfNotifications++;
            }
        });
    }
}
