const mongoose = require('mongoose');
require('../system/mongoose-stringtype')(mongoose);
const Schema = mongoose.Schema;
const StringType = Schema.Types.StringType;

const config = require('../system/parseConfig');
const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);

const elastic = require('./elastic');
const dbLogger = require('../log/dbLogger.js');

// for DAO manager
exports.type = 'board';

let pinSchema = {
    tinyId: StringType,
    type: {type: StringType, default: 'cde', enum: ['cde', 'form']},
    pinnedDate: Date,
};

let pinningBoardSchema = new Schema({
    name: StringType,
    description: StringType,
    type: {type: StringType, default: 'cde', enum: ['cde', 'form']},
    tags: [StringType],
    shareStatus: StringType,
    createdDate: Date,
    updatedDate: Date,
    owner: {
        userId: Schema.Types.ObjectId,
        username: StringType
    },
    pins: [pinSchema],
    users: [{
        username: StringType,
        role: {type: StringType, default: 'viewer', enum: ['viewer', 'reviewer']},
        lastViewed: Date,
        status: {
            approval: {
                type: StringType,
                default: 'invited',
                enum: ['invited', 'approved', 'disapproved'],
            },
            reviewedDate: Date
        }
    }],
    review: {
        startDate: Date,
        endDate: Date
    }
}, {
    usePushEach: true, toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

pinningBoardSchema.pre('save', function (next) {
    let id = this._id.toString();
    let board = this.toObject();
    delete board._id;
    elastic.updateOrInsertBoardById(id, board, err => {
        if (err) {
            dbLogger.logError({
                message: "Unable to index board: " + id,
                origin: "board.elastic.boardUpdateOrInsert",
                stack: err,
                details: ""
            });
        }
        next();
    });
});
pinningBoardSchema.pre('remove', function (next) {
    let id = this._id.toString();
    elastic.deleteBoardById(id, err => {
        if (err) {
            dbLogger.logError({
                message: "Unable to delete board: " + id,
                origin: "board.elastic.deleteBoardById",
                stack: err,
                details: ""
            });
        }
        next();
    });
});

pinningBoardSchema.virtual('elementType').get(() => 'board');
pinningBoardSchema.set('collection', 'pinningBoards');
let PinningBoard = conn.model('PinningBoard', pinningBoardSchema);
exports.PinningBoard = exports.dao = PinningBoard;


exports.getPrimaryName = function (elt) {
    return elt.name;
};

exports.getStream = function (condition) {
    return PinningBoard.find(condition).sort({_id: -1}).cursor();
};

exports.count = function (condition, callback) {
    PinningBoard.countDocuments(condition, callback);
};

exports.boardsByUserId = function (userId, callback) {
    PinningBoard.find({"owner.userId": userId}).sort({"updatedDate": -1}).exec(function (err, result) {
        callback(result);
    });
};

exports.publicBoardsByPinTinyId = (tinyId, callback) => {
    PinningBoard.find({"pins.tinyId": tinyId, "shareStatus": "Public"}, callback);
};

exports.nbBoardsByUserId = function (userId, callback) {
    PinningBoard.countDocuments({"owner.userId": userId}, callback);
};

exports.boardById = function (boardId, callback) {
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
        callback(undefined, undefined);
        return;
    }
    PinningBoard.findById(boardId, function (err, b) {
        if (b && !b.type) {
            b.type = 'cde';
        }
        callback(err, b);
    });
};

exports.byId = exports.boardById;

exports.boardList = function (from, limit, searchOptions, callback) {
    PinningBoard.find(searchOptions).exec(function (err, boards) {
        PinningBoard.countDocuments(searchOptions, (err, count) => {
            callback(err, {
                boards: boards,
                page: Math.ceil(from / limit),
                pages: Math.ceil(count / limit),
                totalNumber: count,
            });
        });
    });
};

exports.newBoard = function (board, callback) {
    new PinningBoard(board).save(callback);
};

