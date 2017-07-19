exports.getFormQuestions = function (form) {
    var getQuestions = function (fe) {
        var qs = [];
        if (fe.formElements) {
            fe.formElements.forEach(function (e) {
                if (e.elementType === 'question') qs.push(e.question);
                else qs = qs.concat(getQuestions(e));
            });
        }
        return qs;
    };
    return getQuestions(form);
};

exports.getFormCdes = function (form) {
    return exports.getFormQuestions(form).map(function (q) {
        return q.cde;
    });
};

