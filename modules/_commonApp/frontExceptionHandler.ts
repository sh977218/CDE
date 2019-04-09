import { ErrorHandler, Injectable } from '@angular/core';

type AngularError = any;

@Injectable()
export class FrontExceptionHandler implements ErrorHandler {
    lock = false;
    previousException: AngularError;

    constructor(
    ) {}

    handleError (error: AngularError) {
        if (this.previousException && error.toString() === this.previousException.toString()) return;
        this.previousException = error;
        console.error(error);
        if (typeof error.message === "object") {
            try {
                error.message = JSON.stringify(error.message).substr(0, 500);
            } catch (e) {}
        }
        try {
            if (!this.lock) {
                this.lock = true;
                fetch('/server/log/clientExceptionLogs', {
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        stack: error.stack,
                        message: typeof error !== 'string' ? error.message : 'bad throw and error: ' + error, // TODO: remove, possibly never a string
                        name: error.name,
                        url: window.location.href
                    }),
                })
                    .finally(() => {
                        setTimeout(() => {
                            this.lock = false;
                        }, 5000);
                    });
            }
        } catch (e) {
        }
    }
}
