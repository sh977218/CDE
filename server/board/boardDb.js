const Schema = require('mongoose').Schema;

const sharedSchemas = require('../system/schemas.js');
const stringType = sharedSchemas.stringType;
const elastic = require('./elastic');

// for DAO manager
exports.type = 'board';

let pinSchema = new Schema({
    name: stringType,
    tinyId: stringType,
    type: Object.assign({default: 'cde', enum: ['cde', 'form']}, stringType),
    pinnedDate: Date,
    deTinyId: stringType,
    deName: stringType,
    formTinyId: stringType,
    formName: stringType
}, {_id: false});

let pinningBoardSchema = new Schema({
    name: stringType,
    description: stringType,
    type: Object.assign({default: 'cde', enum: ['cde', 'form']}, stringType),
    tags: [stringType],
    shareStatus: stringType,
    createdDate: Date,
    updatedDate: Date,
    owner: {
        userId: Schema.Types.ObjectId,
        username: stringType
    },
    pins: [pinSchema],
    users: [{
        username: stringType,
        role: Object.assign({default: 'viewer', enum: ['viewer', 'reviewer']}, stringType),
        lastViewed: Date,
        status: {
            approval: Object.assign({
                default: 'invited',
                enum: ['invited', 'approved', 'disapproved']
            }, stringType),
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
    elastic.updateOrInsertBoardById(id, board);
    next();
});
pinningBoardSchema.pre('remove', function (next) {
    let id = this._id.toString();
    elastic.deleteBoardById(id);
    next();
});

pinningBoardSchema.virtual('elementType').get(() => 'board');
pinningBoardSchema.set('collection', 'pinningBoards');
let PinningBoard = conn.model('PinningBoard', pinningBoardSchema);
exports.PinningBoard = PinningBoard;


exports.getPrimaryName = function (elt) {
    return elt.name;
};

exports.getStream = function (condition) {
    return PinningBoard.find(condition).sort({_id: -1}).cursor();
};

exports.count = function (condition, callback) {
    PinningBoard.count(condition).exec(callback);
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
    PinningBoard.count({"owner.userId": userId}).exec(callback);
};

exports.boardById = function (boardId, callback) {
    PinningBoard.findOne({'_id': boardId}, function (err, b) {
        if (err) callback(err, b);
        else if (!b) {
            callback("Cannot find board. boardId: " + boardId, b);
        }
        else {
            if (!b.type) b.type = 'cde';
            callback(null, b);
        }
    });
};

exports.byId = exports.boardById;

exports.boardList = function (from, limit, searchOptions, callback) {
    PinningBoard.find(searchOptions).exec(function (err, boards) {
        PinningBoard.count(searchOptions).exec(function (err, count) {
            callback(err, {
                boards: boards
                , page: Math.ceil(from / limit)
                , pages: Math.ceil(count / limit)
                , totalNumber: count
            });
        });
    });
};

exports.newBoard = function (board, callback) {
    var newBoard = new PinningBoard(board);
    newBoard.save(function (err) {
        callback(err, newBoard);
    });
};
