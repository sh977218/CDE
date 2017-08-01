let mongo_board = require('./mongo-board');
let _ = require("lodash");

let propMapping = {
    'cde': {id: "deTinyId", name: "deName"},
    'form': {id: "formTinyId", name: "formName"}
};

exports.pinDataElements = function (req, res) {
    if (!req.isAuthenticated()) return res.send("Please login first.");
    let boardId = req.params.id;
    let cdes = req.body;
    if (!Array.isArray(cdes)) return res.status(400).send();
    mongo_board.byId(boardId, function (err, board) {
        if (err) return res.status(500).send(err);
        let cdePins = cdes.map(c => {
            return {
                deTinyId: c.tinyId,
                deName: c.name,
                pinnedDate: new Date()
            };
        });
        board.pins = _.uniqWith(board.pins.concat(cdePins), (a, b) => a.deTinyId === b.deTinyId);
        board.save(e => {
            if (e) return res.status(500).send(e);
            let message = "Added to Board";
            if (cdes.length > 1)
                message = "All elements pinned.";
            res.send(message);
        });
    });
};
exports.pinForms = function (req, res) {
    if (!req.isAuthenticated()) return res.send("Please login first.");
    let boardId = req.param.id;
    let forms = req.body;
    if (!Array.isArray(forms)) return res.status(400).send();
    mongo_board.byId(boardId, function (err, board) {
        if (err) return res.status(500).send(err);
        let formPins = forms.map(c => {
            return {
                formTinyId: c.tinyId,
                formName: c.name,
                pinnedDate: new Date()
            };
        });
        board.pins = _.uniqWith(board.pins.concat(formPins), (a, b) => a.formTinyId === b.formTinyId);
        board.save(e => {
            if (e) return res.status(500).send(e);
            res.send();
        });
    });
};
/* ---------- PUT NEW REST API above ---------- */


exports.pinToBoard = function (req, res, dao) {
    var tinyId = req.params.tinyId;
    var boardId = req.params.boardId;

    dao.byTinyId(tinyId, function (err, elt) {
        mongo_board.boardById(boardId, function (err, board) {
            if (err) return res.send("Board cannot be found.");
            if (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id)) {
                return res.send("You must own a board to edit it.");
            } else {
                var pin = {
                    pinnedDate: Date.now()
                };
                pin[propMapping[dao.type].id] = tinyId;
                pin[propMapping[dao.type].name] = elt.naming[0].designation;
                for (var i = 0; i < board.pins.length; i++) {
                    if (JSON.stringify(board.pins[i][propMapping[dao.type].id]) === JSON.stringify(tinyId)) {
                        res.statusCode = 202;
                        return res.send("Already added to the board.");
                    }
                }
                board.pins.push(pin);
                board.save(function () {
                    return res.send("Added to Board");
                });
            }
        });
    });
};

exports.removePinFromBoard = function (req, res, dao) {
    var boardId = req.params.boardId;
    var tinyId = req.params.tinyId;
    mongo_board.boardById(boardId, function (err, board) {
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

exports.pinAllToBoard = function (req, cdes, res) {
    var ids = cdes.map(function (cde) {
        return cde.tinyId;
    });
    var boardId = req.body.board._id;
    mongo_board.boardById(boardId, function (err, board) {
        if (err) return res.send("Board cannot be found.");
        if (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id)) {
            return res.send("You must own a board to edit it.");
        } else {
            ids.forEach(function (id) {
                var pin = {
                    pinnedDate: Date.now()
                    , deTinyId: id
                };
                for (var i = 0; i < board.pins.length; i++) {
                    if (JSON.stringify(board.pins[i].deTinyId) === JSON.stringify(id)) {
                        return;
                    }
                }
                board.pins.push(pin);
            });
            board.save(function () {
                return res.send("Added to Board");
            });
        }
    });
};