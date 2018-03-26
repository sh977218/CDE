import { HttpErrorResponse } from '@angular/common/http';

export class AngularHelperService {
    private constructor() {}

    static httpErrorMessage(err: any) {
        if (err instanceof HttpErrorResponse) {
            if (err.message === 'Http failure response for (unknown url): 0 Unknown Error') {
                return 'Server is not available or you are offline.';
            }
            return err.message;
        } else if (err.error instanceof Error) { // client-side
            return err.error.message;
        } else { // server-side
            return err.error;
        }
    }
}
