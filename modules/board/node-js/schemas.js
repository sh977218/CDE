var mongoose = require('mongoose');

var schemas = {};

var pinSchema = new mongoose.Schema({
    name: String
    , pinnedDate: Date
    , deTinyId: String
    , deName: String
    , formTinyId: String
    , formName: String
}, {_id: false});

schemas.pinningBoardSchema = new mongoose.Schema({
    name: String,
    description: String,
    type: {type: String, default: 'cde', enum: ['cde', 'form']},
    tags: [String],
    shareStatus: String,
    createdDate: Date,
    updatedDate: Date,
    owner: {
        userId: mongoose.Schema.Types.ObjectId,
        username: String
    },
    pins: [pinSchema],
    users: [{
        username: String,
        role: {type: String, enum: ['viewer', 'reviewer']},
        lastView: Date,
        status: {type: String, default: 'invited', enum: ['invited', 'approved', 'disapproved']}
    }],
    status: String,
    startReviewDate: Date,
    endReviewDate: Date
});
schemas.pinningBoardSchema.pre('save', function (next) {
    this.updatedDate = Date.now();
    next();
});
schemas.pinningBoardSchema.set('collection', 'pinningBoards');

module.exports = schemas;

