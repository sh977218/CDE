import { HttpClient } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class FrontExceptionHandler implements ErrorHandler {
    lock = false;
    previousException;

    constructor(
        private http: HttpClient
    ) {}

    handleError (error) {
        if (this.previousException && error.toString() === this.previousException.toString()) return;
        this.previousException = error;
        console.error(error);
        try {
            if (!this.lock) {
                this.lock = true;
                this.http.post('/server/log/clientExceptionLogs', {
                    stack: error.stack,
                    message: error.message,
                    name: error.name,
                    url: window.location.href
                }).subscribe(() => {
                    setTimeout(() => {
                        this.lock = false;
                    }, 5000);
                });
            }
        } catch (e) {
        }
    }
}
