const schemas = require('./schemas');
const config = require('../system/parseConfig');
const connHelper = require('../system/connections');

const conn = connHelper.establishConnection(config.database.appData);
const Comment = conn.model('Comment', schemas.commentSchema);

exports.Comment = Comment;

exports.byId = (id, callback) => {
    Comment.findById(id, callback);
};
exports.byReplyId = (id, callback) => {
    Comment.findOne({'replies.id': id}, callback);
};

exports.save = (comment, callback) => {
    new Comment.save(comment, callback);
};

exports.removeById = (id, callback) => {
    Comment.findByIdAndRemove(id, callback);
};


exports.commentsForUser = (username, from, size, callback) => {
    Comment.find({username: username}).skip(from).limit(size).sort({created: -1}).exec(callback);
};
exports.allComments = (from, size, callback) => {
    Comment.find().skip(from).limit(size).sort({created: -1}).exec(callback);
};


exports.orgComments = (myOrgs, from, size, callback) => {
    Comment.aggregate(
        [{
            $lookup: {
                from: 'dataelements',
                localField: 'element.eltId',
                foreignField: 'tinyId',
                as: 'embeddedCde'
            }
        }, {
            $lookup: {
                from: 'forms',
                localField: 'element.eltId',
                foreignField: 'tinyId',
                as: 'embeddedForm'
            }
        }, {
            $match: {
                $or: [
                    {'embeddedCde.stewardOrg.name': {$in: myOrgs}},
                    {'embeddedForm.stewardOrg.name': {$in: myOrgs}},
                    {'embeddedCde.classification.stewardOrg.name': {$in: myOrgs}},
                    {'embeddedForm.classification.stewardOrg.name': {$in: myOrgs}}
                ]
            }
        }, {$sort: {created: -1}}, {$skip: from}, {$limit: size}], callback);
};