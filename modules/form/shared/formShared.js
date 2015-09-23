if (typeof(exports) === "undefined") exports = {};

exports.getFormQuestions = function(form){
    var getQuestions = function(fe){
        var qs = [];
        fe.formElements.forEach(function(e){
            if (e.elementType === 'question') qs.push(e.question);
            else qs = qs.concat(getQuestions(e));
        });
        return qs;
    };
    return getQuestions(form);
};