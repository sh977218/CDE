import { ErrorHandler, Injectable } from "@angular/core";
import { Http } from '@angular/http';

@Injectable()
export class FrontExceptionHandler implements ErrorHandler {
    previousException;
    lock = false;

    constructor(private http: Http) {}

    handleError (error) {
        if (this.previousException && error.toString() === this.previousException.toString()) return;
        this.previousException = error;
        console.error(error);
        try {
            if (!this.lock) {
                this.lock = true;
                this.http.post('/logClientException', {
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