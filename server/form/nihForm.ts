import * as JXON from 'jxon';

export function getFormNih(form, cb) {
    delete form._id;
    delete form.history;
    form.formElements.forEach(s => {
        s.formElements.forEach(q => {
            delete q._id;
        });
    });
    cb(null, JXON.jsToString({element: form}));
}
