var async = require('async');
var DataElementModel = require('../modules/cde/node-js/mongo-cde').DataElement;
var FormModel = require('../modules/form/node-js/mongo-form').Form;
var BoardModel = require('../modules/cde/node-js/mongo-cde').PinningBoard;

var cdeCount = 0;

function updateFormCdeWithTinyId(form, oldTinyId, newTinyId) {
    var getCdes = function (fe) {
        fe.formElements.forEach(function (e) {
            if (e.elementType === 'question') {
                var cde = e.question.cde;
                if (cde.tinyId === oldTinyId)
                    cde.tinyId = newTinyId;
            } else getCdes(e);
        });
    };
    return getCdes(form);
}

function run() {
    DataElementModel.find({tinyId: {$regex: '-'}}).limit(2000).exec(function (err, existingCdes) {
        if (err) throw err;
        if (existingCdes && existingCdes.length === 0) {
            console.log('no more cde with tinyId contains "-".');

            process.exit(0);
        } else if (existingCdes && existingCdes.length > 0) {
            async.eachSeries(existingCdes, function (existingCde, doneOneCde) {
                var oldTinyId = existingCde.get('tinyId');
                var newTinyId = oldTinyId.replace(/-/g, 'A');
                async.series([
                    function updateForm(doneUpdateForm) {
                        FormModel.find({'formElements.formElements.question.cde.tinyId': oldTinyId}).exec(function (err, existingForms) {
                            if (err) throw err;
                            if (existingForms && existingForms.length === 0) doneUpdateForm();
                            else if (existingForms && existingForms.length > 0) {
                                async.eachSeries(existingForms, function (existingForm, doneOneForm) {
                                    updateFormCdeWithTinyId(existingForm, oldTinyId, newTinyId);
                                    existingForm.markModified('formElements');
                                    existingForm.save(function () {
                                        doneOneForm();
                                    });
                                }, function doneAllForms() {
                                    doneUpdateForm();
                                });
                            } else doneUpdateForm();
                        });
                    },
                    function updateBoard(doneUpdateBoard) {
                        BoardModel.find({'pins.deTinyId': oldTinyId}).exec(function (err, existingBoards) {
                            if (err) throw err;
                            if (existingBoards && existingBoards.length === 0) doneUpdateBoard();
                            else if (existingBoards && existingBoards.length > 0) {
                                async.eachSeries(existingBoards, function iterator(existingBoard, doneOneBoard) {
                                    existingBoard.get('pins').forEach(function (pin) {
                                        if (pin.deTinyId === oldTinyId)
                                            pin.deTinyId = newTinyId;
                                    });
                                    existingBoard.markModified('pins');
                                    existingBoard.save(function () {
                                        doneOneBoard();
                                    });
                                }, function doneAllBoards() {
                                    doneUpdateBoard();
                                });
                            } else doneUpdateBoard();
                        });
                    },
                    function updateCde() {
                        existingCde.set('tinyId', newTinyId);
                        existingCde.markModified('tinyId');
                        existingCde.save(function () {
                            cdeCount++;
                            console.log('CDE ' + oldTinyId + ' update to ' + newTinyId);
                            console.log('CDE count: ' + cdeCount);
                            doneOneCde();
                        });
                    }
                ]);
            }, function doneAllCdes() {
                console.log('finished all cdes. cdeCount: ' + cdeCount);

                process.exit(0);
            });
        } else {

            process.exit(0);
        }
    });
}

run();