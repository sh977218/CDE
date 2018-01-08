const JXON = require("jxon");

exports.getFormNih = function (form, cb) {
    delete form._id;
    delete form.history;
    form.formElements.forEach(function (s) {
        s.formElements.forEach(function (q) {
            delete q._id;
        });
    });
    cb(null, JXON.jsToString({element: form}));
};
