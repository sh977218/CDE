import { ErrorHandler, Injectable } from "@angular/core";

@Injectable()
export class FrontExceptionHandler implements ErrorHandler {
    previousException;
    lock = false;

    handleError (error) {
        console.log("INJECTED  ERROR !");

        //
        // $provide.decorator("$exceptionHandler", ['$delegate', '$injector',
        //     function ($delegate, $injector) {
        //         return function (exception, cause) {
        //             $delegate(exception, cause);
        // if (this.previousException && error.toString() === this.previousException.toString()) return;
        // this.previousException = error;
        // try {
        //     // if (exception.message.indexOf("[$compile:tpload]") > -1) return;
        //     // if (!lock) {
        //     //     lock = true;
        //     //     $injector.get('$http').post('/logClientException', {
        //     //         stack: exception.stack,
        //     //         message: exception.message,
        //     //         name: exception.name,
        //     //         url: window.location.href
        //     //     });
        //     //     $injector.get('$timeout')(function () {
        //     //         lock = false;
        //     //     }, 5000);
        //     // }
        // } catch (e) {
        //
        // }
                // };
            // }]);

    }
}