var config = require('../../system/node-js/parseConfig');
var schemas = require('./schemas');
var connHelper = require('../../system/node-js/connections');

exports.type = "board";
exports.name = "boards";

var conn = connHelper.establishConnection(config.database.appData);
var PinningBoard = conn.model('PinningBoard', schemas.pinningBoardSchema);

exports.PinningBoard = PinningBoard;

schemas.pinningBoardSchema.pre('save', function (next) {
    var self = this;
    elastic.boardUpdateOrInsert(self);
    next();
});
schemas.pinningBoardSchema.pre('remove', function (next) {
    var self = this;
    elastic.boardDelete(self);
    next();
});

exports.getStream = function (condition) {
    return PinningBoard.find(condition).sort({_id: -1}).stream();
};

exports.count = function (condition, callback) {
    PinningBoard.count(condition).exec(callback);
};

exports.boardsByUserId = function (userId, callback) {
    PinningBoard.find({"owner.userId": userId}).sort({"updatedDate": -1}).exec(function (err, result) {
        callback(result);
    });
};

exports.nbBoardsByUserId = function (userId, callback) {
    PinningBoard.count({"owner.userId": userId}).exec(function (err, result) {
        callback(err, result);
    });
};

exports.boardById = function (boardId, callback) {
    PinningBoard.findOne({'_id': boardId}, function (err, b) {
        if (!b) err = "Cannot find board";
        if (!b.type) b.type = 'cde';
        callback(err, b);
    });
};

exports.boardList = function (from, limit, searchOptions, callback) {
    PinningBoard.find(searchOptions).exec(function (err, boards) {
        // TODO Next line throws "undefined is not a function.why?
        PinningBoard.find(searchOptions).count(searchOptions).exec(function (err, count) {
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

