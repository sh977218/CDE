var deepDiff = require('deep-diff')
;

exports.diff = function (newCde, oldCde) {
    var newCdeObj = newCde.toObject ? newCde.toObject() : newCde;
    var oldCdeObj = oldCde.toObject ? oldCde.toObject() : oldCde;
    [newCdeObj, oldCdeObj].forEach(function (cde) {
        delete cde._id;
        delete cde.updated;
        delete cde.updatedBy;
        delete cde.archived;
        delete cde.history;
        delete cde.changeNote;
        delete cde.__v;
        delete cde.views;
        delete cde.comments;
    });
    return deepDiff(oldCdeObj, newCdeObj);
};