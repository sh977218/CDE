var mongo_board = require('./mongo-board');

var propMapping = {
    'cde': {id: "deTinyId", name: "deName"},
    'form': {id: "formTinyId", name: "formName"}
};

exports.pinToBoard = function(req, res, dao) {
    var tinyId = req.params.tinyId;
    var boardId = req.params.boardId;

    dao.eltByTinyId(tinyId, function(err, elt){
        mongo_board.boardById(boardId, function(err, board) {
            if (err) return res.send("Board cannot be found.");
            if (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id)) {
                return res.send("You must own a board to edit it.");
            } else {
                var pin = {
                    pinnedDate: Date.now()
                };
                pin[propMapping[dao.type].id] = tinyId;
                pin[propMapping[dao.type].name] = elt.naming[0].designation;
                for (var i = 0 ; i < board.pins.length; i++) {
                    if (JSON.stringify(board.pins[i][propMapping[dao.type].id]) === JSON.stringify(tinyId)) {
                        res.statusCode = 202;
                        return res.send("Already added to the board.");
                    }
                }
                board.pins.push(pin);
                board.save(function() {
                    return res.send("Added to Board");
                });
            }
        });
    });
};

exports.removePinFromBoard = function(req, res, dao) {
    var boardId = req.params.boardId;
    var tinyId = req.params.tinyId;
    mongo_board.boardById(boardId, function(err, board) {
        if (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id)) {
            return res.send("You must own a board to edit it.");
        } else {
            var modified;
            for (var i = 0; i < board.pins.length; i++) {
                if (JSON.stringify(board.pins[i][propMapping[dao.type].id]) === JSON.stringify(tinyId)) {
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
            board.save(function() {
                return res.send("Added to Board");
            });
        }
    });
};