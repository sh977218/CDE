var config = require('../../system/node-js/parseConfig');
var schemas = require('./schemas');
var connHelper = require('../../system/node-js/connections');
var elastic = require('../../cde/node-js/elastic');

exports.type = "board";
exports.name = "boards";

var conn = connHelper.establishConnection(config.database.appData);

schemas.pinningBoardSchema.pre('save', function (next) {
    this.updatedDate = Date.now();
    var self = this;
    elastic.boardUpdateOrInsert(self);
    next();
});
schemas.pinningBoardSchema.pre('remove', function (next) {
    var self = this;
    elastic.boardDelete(self);
    next();
});

var PinningBoard = conn.model('PinningBoard', schemas.pinningBoardSchema);
exports.PinningBoard = PinningBoard;

exports.getPrimaryName = function (elt) {
    return elt.name;
};

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

exports.publicBoardsByDeTinyId = function (tinyId, callback) {
    PinningBoard.find({"pins.deTinyId": tinyId, "shareStatus": "Public"}).exec(function (err, result) {
        callback(result);
    });
};
exports.publicBoardsByFormTinyId = function (tinyId, callback) {
    PinningBoard.find({"pins.formTinyId": tinyId, "shareStatus": "Public"}).exec(function (err, result) {
        callback(result);
    });
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


