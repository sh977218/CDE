const Comment = require('../../server/discuss/discussDb').Comment;

exports.wipeUseless = function (toWipeCde) {
    delete toWipeCde._id;
    delete toWipeCde.history;
    delete toWipeCde.imported;
    delete toWipeCde.created;
    delete toWipeCde.createdBy;
    delete toWipeCde.updated;
    delete toWipeCde.updatedBy;
    delete toWipeCde.comments;
    delete toWipeCde.registrationState;
    delete toWipeCde.tinyId;
    delete toWipeCde.valueDomain.datatypeValueList;

    Object.keys(toWipeCde).forEach(function (key) {
        if (Array.isArray(toWipeCde[key]) && toWipeCde[key].length === 0) {
            delete toWipeCde[key];
        }
    });
};

exports.trimWhite = function (text) {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ');
};

exports.checkNullComments = () => {
    return Comment.aggregate([
        {
            $lookup: {
                from: 'dataelements',
                localField: 'element.eltId',
                foreignField: 'tinyId',
                as: 'cdes'
            }
        },
        {
            $lookup: {
                from: 'forms',
                localField: 'element.eltId',
                foreignField: 'tinyId',
                as: 'forms'
            }
        },
        /*  mongo db current does not support yet. 4.0 will support
              {
                    $lookup: {
                        from: 'pinningBoards',
                        localField: 'element.eltId',
                        foreignField: '_id.str',
                        as: 'boards'
                    }
                },
        */
        {
            $match: {'cdes.0': {$exists: false}, 'forms.0': {$exists: false}, 'element.eltType': {$ne: 'board'}}
        }
    ]).exec();
};
