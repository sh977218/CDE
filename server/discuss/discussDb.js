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