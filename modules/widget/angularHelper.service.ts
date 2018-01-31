import { HttpErrorResponse } from '@angular/common/http';

export class AngularHelperService {
    private constructor() {}

    static httpErrorMessage(err: HttpErrorResponse) {
        if (err.error instanceof Error) { // client-side
            return err.error.message;
        } else { // server-side
            return err.error;
        }
    }
}
