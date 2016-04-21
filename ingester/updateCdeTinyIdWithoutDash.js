var mongoose = require('mongoose'),
    config = require('../modules/system/node-js/parseConfig'),
    schemas = require('../modules/system/node-js/schemas.js'),
    cde_schemas = require('../modules/cde/node-js/schemas'),
    form_schemas = require('../modules/form/node-js/schemas'),
    async = require('async');


function updateFormCdeWithTinyId(form, oldTinyId, newTinyId) {
    var getCdes = function (fe) {
        fe.formElements.forEach(function (e) {
            if (e.elementType === 'question') {
                var cde = e.question.cde;
                if (cde.tinyId === oldTinyId)
                    cde.tinyId = newTinyId;
            }
            else getCdes(e);
        });
    };
    return getCdes(form);
}
function updateBoardCdeWithTinyId(board, oldTinyId, newTinyId) {
    board.pins.forEach(function (pin) {
        if (pin.deTinyId === oldTinyId)
            pin.deTinyId = newTinyId;
    });
}

var allOldCdeTinyId, conn, DataElement, Form, Board;
var cdeCond = {tinyId: {$regex: '-'}};

async.series([
    function setUp(doneSetup) {
        allOldCdeTinyId = [];
        conn = mongoose.createConnection(config.mongoUri);
        conn.on('error', console.error.bind(console, 'connection error:'));
        conn.once('open', function callback() {
            console.log('mongodb connection open');
            DataElement = conn.model('DataElement', cde_schemas.dataElementSchema);
            Form = conn.model('Form', form_schemas.formSchema);
            Board = conn.model('Board', cde_schemas.pinningBoardSchema);
            doneSetup();
        });
    },
    function findCde() {
        DataElement.find(cdeCond).exec(function (err, existingCdes) {
            if (err) throw err;
            var oldTinyId, newTinyId;
            async.eachSeries(existingCdes, function iterator(existingCde, doneOneCde) {
                async.series([
                    function updateCde(doneUpdateCde) {
                        oldTinyId = existingCde.get('tinyId');
                        allOldCdeTinyId.push({
                            tinyId: existingCde.get('tinyId'),
                            archived: existingCde.get('archived'),
                            status: existingCde.get('registrationState').registrationStatus
                        });
                        newTinyId = oldTinyId.replace(/-/g, 'A');
                        existingCde.set('tinyId', newTinyId);
                        existingCde.markModified('tinyId');
                        existingCde.save(function () {
                            console.log('CDE ' + oldTinyId + ' update to ' + newTinyId);
                            doneUpdateCde();
                        });
                    },
                    function updateForm(doneUpdateForm) {
                        var formCond = {'formElements.formElements.question.cde.tinyId': oldTinyId};
                        Form.find(formCond).exec(function (err, existingForms) {
                            if (err) throw err;
                            var allFormWithThisCde = [];
                            async.eachSeries(existingForms, function iterator(existingForm, doneOneForm) {
                                allFormWithThisCde.push({
                                    tinyId: existingForm.get('tinyId'),
                                    archived: existingForm.get('archived'),
                                    status: existingForm.get('registrationState').registrationStatus
                                });
                                updateFormCdeWithTinyId(existingForm, oldTinyId, newTinyId);
                                existingForm.save(function () {
                                    doneOneForm();
                                });
                            }, function doneAllForms() {
                                console.log(allFormWithThisCde.length + ' forms:' + JSON.stringify(allFormWithThisCde));
                                doneUpdateForm();
                            });
                        });
                    },
                    function updateBoard(doneUpdateBoard) {
                        var boardCond = {'pins.deTinyId': oldTinyId};
                        Board.find(boardCond).exec(function (err, existingBoards) {
                            if (err) {
                                console.log(err);
                                process.exit(1);
                            }
                            var allBoardWithThisCde = [];
                            async.eachSeries(existingBoards, function iterator(existingBoard, doneOneBoard) {
                                allBoardWithThisCde.push({
                                    _id: existingBoard.get('_id')
                                });
                                updateBoardCdeWithTinyId(existingBoard, oldTinyId, newTinyId);
                                existingBoard.save(function () {
                                    doneOneBoard();
                                });
                            }, function doneAllBoards() {
                                console.log(allBoardWithThisCde.length + ' boards: ' + JSON.stringify(allBoardWithThisCde));
                                doneUpdateBoard();
                            });
                        });
                    },
                    function () {
                        doneOneCde();
                    }
                ]);

            }, function doneAllCdes() {
                console.log('done ' + allOldCdeTinyId.length + ' CDEs with tinyId contains "-"');
                console.log('all old CDE tinyId:\n' + JSON.stringify(allOldCdeTinyId));
                //noinspection JSUnresolvedVariable
                process.exit(0);
            });
        });
    }
]);

