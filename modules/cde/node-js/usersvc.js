var mongo_data = require('./mongo-cde')
    , elastic = require('./elastic')
    ;

exports.pinToBoard = function(req, res) {
    var tinyId = req.params.tinyId;
    var boardId = req.params.boardId;

    mongo_data.eltByTinyId(tinyId, function(err, de){
        mongo_data.boardById(boardId, function(err, board) {
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
                mongo_data.save(board, function(err, b) {
                    return res.send("Added to Board");
                });
            }
        });
    });
};

exports.removePinFromBoard = function(req, res) {
    var boardId = req.params.boardId;
    var pinId = req.params.pinId;
    mongo_data.boardById(boardId, function(err, board) {
        if (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id)) {
            return res.send("You must own a board to edit it.");
        } else {
            for (var i = 0; i < board.pins.length; i++) {
                if (JSON.stringify(board.pins[i]._id) === JSON.stringify(pinId)) {
                    board.pins.splice(i, 1);
                    return board.save(function (err, b) {
                        res.send("Removed");
                    });
                }
            }
            res.send("Nothing removed");
        }
    });
};

exports.pinAllToBoard = function(req, cdes, res) {
    var ids = cdes.map(function(cde) {return cde.tinyId;});
    var boardId = req.body.board._id;
    mongo_data.boardById(boardId, function(err, board) {
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
            mongo_data.save(board, function(err, b) {
                return res.send("Added to Board");
            });
        }
    });
};