import * as JXON from 'jxon';
import { CdeForm } from 'shared/form/form.model';
import { CbError1 } from 'shared/models.model';

export function getFormNih(form: CdeForm, cb: CbError1<string>) {
    delete form._id;
    delete form.history;
    form.formElements.forEach(s => {
        s.formElements.forEach(q => {
            delete q._id;
        });
    });
    cb(null, JXON.jsToString({element: form}));
}
