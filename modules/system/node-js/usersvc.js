var mongo_data = require('./../../cde/node-js/mongo-cde'),
    mongo_form = require('../../form/node-js/mongo-form'),
    mongo_board = require('../../board/node-js/mongo-board')
    ;

exports.pinCdeToBoard = function(req, res) {
    var tinyId = req.params.tinyId;
    var boardId = req.params.boardId;

    mongo_data.eltByTinyId(tinyId, function(err, de){
        mongo_board.boardById(boardId, function(err, board) {
            if (err) return res.send("Board cannot be found.");
            if (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id)) {
                return res.send("You must own a board to edit it.");
            } else {
                var pin = {
                    pinnedDate: Date.now()
                    , deTinyId: tinyId
                    , deName: de.naming[0].designation
                };
                for (var i = 0 ; i < board.pins.length; i++) {
                    if (JSON.stringify(board.pins[i].deTinyId) === JSON.stringify(tinyId)) {
                        res.statusCode = 202;
                        return res.send("Already added to the board.");
                    }
                }
                board.pins.push(pin);
                mongo_data.save(board, function() {
                    return res.send("Added to Board");
                });
            }
        });
    });
};
exports.pinFormToBoard = function(req, res) {
    var tinyId = req.params.tinyId;
    var boardId = req.params.boardId;

    mongo_form.eltByTinyId(tinyId, function(err, form){
        mongo_board.boardById(boardId, function(err, board) {
            if (err) return res.send("Board cannot be found.");
            if (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id)) {
                return res.send("You must own a board to edit it.");
            } else {
                var pin = {
                    pinnedDate: Date.now()
                    , formTinyId: tinyId
                    , formName: form.naming[0].designation
                };
                for (var i = 0 ; i < board.pins.length; i++) {
                    if (JSON.stringify(board.pins[i].formTinyId) === JSON.stringify(tinyId)) {
                        res.statusCode = 202;
                        return res.send("Already added to the board.");
                    }
                }
                board.pins.push(pin);
                mongo_data.save(board, function() {
                    return res.send("Added to Board");
                });
            }
        });
    });
};

exports.removePinFromBoard = function(req, res) {
    var boardId = req.params.boardId;
    var deTinyId = req.params.deTinyId;
    mongo_board.boardById(boardId, function(err, board) {
        if (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id)) {
            return res.send("You must own a board to edit it.");
        } else {
            var modified;
            for (var i = 0; i < board.pins.length; i++) {
                if (JSON.stringify(board.pins[i].deTinyId) === JSON.stringify(deTinyId)) {
                    board.pins.splice(i, 1);
                    modified = true;
                }
            }
            if (modified) {
                board.save(function () {
                    res.send("Removed");
                });
            } else res.send("Nothing removed");
        }
    });
};

exports.pinAllToBoard = function(req, cdes, res) {
    var ids = cdes.map(function(cde) {return cde.tinyId;});
    var boardId = req.body.board._id;
    mongo_board.boardById(boardId, function(err, board) {
        if (err) return res.send("Board cannot be found.");
        if (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id)) {
            return res.send("You must own a board to edit it.");
        } else {
            ids.forEach(function(id){
                var pin = {
                    pinnedDate: Date.now()
                    , deTinyId: id
                };
                for (var i = 0 ; i < board.pins.length; i++) {
                    if (JSON.stringify(board.pins[i].deTinyId) === JSON.stringify(id)) {
                        return;
                    }
                }
                board.pins.push(pin);
            });
            mongo_data.save(board, function() {
                return res.send("Added to Board");
            });
        }
    });
};