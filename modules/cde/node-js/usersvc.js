var mongo_data = require('./mongo-data')
    ;

exports.isCuratorOf = function(user, orgName){
    if (!user) return false;
    return user.orgCurator.indexOf(orgName)>-1 || user.orgAdmin.indexOf(orgName)>-1 || user.siteAdmin;
};

exports.pinToBoard = function(req, res) {
    var uuid = req.params.uuid;
    mongo_data.boardsByUserId(req.user._id, function(boards) {
        var boardId = req.params.boardId;
        mongo_data.boardById(boardId, function(err, board) {
            if (err) return res.send("Board cannot be found.");
            if (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id)) {
                return res.send("You must own a board to edit it.");
            } else {        
                var pin = {
                    pinnedDate: Date.now()
                    , deUuid: uuid
                };
                for (var i = 0 ; i < board.pins.length; i++) {
                    if (JSON.stringify(board.pins[i].deUuid) === JSON.stringify(uuid)) {
                        res.statusCode = 202;
                        return res.send("Already added to the board.");
                    }
                }
                board.pins.push(pin);
                mongo_data.save(board, function(err, b) {
                    return res.send("Added to Board"); 
                });
            }
        })
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
                res.send("Nothing removed");
            }
        }
    });
};
