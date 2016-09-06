var async = require('async');
var By = require('selenium-webdriver').By;

var shared = require('././LOINCShared');

exports.parseAnswerListTable = function (obj, task, table, cb) {
    var sectionName = task.sectionName;
    var answerListObj = {
        answerListId: {},
        answerList: []
    };
    var answerListIdObj = answerListObj.answerListId;
    var answerListArray = answerListObj.answerList;
    var externalDefinedExist = false;
    async.series([
        function (next) {
            table.findElements(By.css('table')).then(function (innerTable) {
                if (innerTable.length > 0) {
                    externalDefinedExist = true;
                    innerTable[0].findElements(By.xpath('tbody/tr')).then(function (innerTrs) {
                        async.forEach(innerTrs, function (innerTr, doneOneInnerTr) {
                            innerTr.findElements(By.xpath('td')).then(function (tds) {
                                var key = '';
                                var value = '';
                                async.series([
                                    function (doneKey) {
                                        tds[0].getText().then(function (keyText) {
                                            key = keyText.replace(/:/g, '').trim();
                                            doneKey();
                                        });
                                    },
                                    function (doneValue) {
                                        tds[1].getText().then(function (valueText) {
                                            value = valueText.trim();
                                            doneValue();
                                        });
                                    }
                                ], function () {
                                    answerListObj[key] = value;
                                    doneOneInnerTr();
                                });
                            });
                        }, function doneAllInnerTrs() {
                            next();
                        });
                    });
                }
                else {
                    next();
                }
            });
        },
        function (next) {
            table.findElements(By.xpath('tbody/tr')).then(function (trs) {
                async.series([
                    function (done) {
                        trs[0].findElement(By.css('a')).then(function (a) {
                            async.parallel([
                                    function (doneHref) {
                                        a.getAttribute('href').then(function (urlText) {
                                            answerListIdObj.URL = urlText.trim();
                                            doneHref();
                                        });
                                    },
                                    function (doneId) {
                                        a.getText().then(function (text) {
                                            answerListIdObj.ID = text.trim();
                                            doneId();
                                        });
                                    }
                                ],
                                function () {
                                    done();
                                });
                        });
                    },
                    function (done) {
                        trs.shift();
                        if (externalDefinedExist) {
                            trs.shift();
                            done();
                        }
                        else {
                            done();
                        }
                    },
                    function (done) {
                        trs.shift();
                        async.forEach(trs, function (tr, doneOneTr) {
                            var answerListItem = {};
                            tr.findElements(By.xpath('td')).then(function (tds) {
                                if (tds.length === 11) {
                                    async.parallel([
                                        function (doneParsingTd) {
                                            tds[1].getText().then(function (text) {
                                                answerListItem['SEQ#'] = text.trim();
                                                doneParsingTd();
                                            });
                                        },
                                        function (doneParsingTd) {
                                            tds[3].getText().then(function (text) {
                                                answerListItem['Answer'] = text.trim();
                                                doneParsingTd();
                                            });
                                        },
                                        function (doneParsingTd) {
                                            tds[5].getText().then(function (text) {
                                                answerListItem['Global ID'] = text.trim();
                                                doneParsingTd();
                                            });
                                        },
                                        function (doneParsingTd) {
                                            tds[7].getText().then(function (text) {
                                                answerListItem['Global ID Code System'] = text.trim();
                                                doneParsingTd();
                                            });
                                        },
                                        function (doneParsingTd) {
                                            tds[9].getText().then(function (text) {
                                                answerListItem['Answer ID'] = text.trim();
                                                doneParsingTd();
                                            });
                                        }
                                    ], function () {
                                        answerListArray.push(answerListItem);
                                        doneOneTr();
                                    });
                                } else if (tds.length === 9) {
                                    async.parallel([
                                        function (doneParsingTd) {
                                            tds[1].getText().then(function (text) {
                                                answerListItem['SEQ#'] = text.trim();
                                                doneParsingTd();
                                            });
                                        },
                                        function (doneParsingTd) {
                                            tds[3].getText().then(function (text) {
                                                answerListItem['Answer'] = text.trim();
                                                doneParsingTd();
                                            });
                                        },
                                        function (doneParsingTd) {
                                            tds[5].getText().then(function (text) {
                                                answerListItem['Code'] = text.trim();
                                                doneParsingTd();
                                            });
                                        },
                                        function (doneParsingTd) {
                                            tds[7].getText().then(function (text) {
                                                answerListItem['Answer ID'] = text.trim();
                                                doneParsingTd();
                                            });
                                        }
                                    ], function () {
                                        answerListArray.push(answerListItem);
                                        doneOneTr();
                                    });
                                } else if (tds.length === 7) {
                                    async.parallel([
                                        function (doneParsingTd) {
                                            tds[1].getText().then(function (text) {
                                                answerListItem['SEQ#'] = text.trim();
                                                doneParsingTd();
                                            });
                                        },
                                        function (doneParsingTd) {
                                            tds[3].getText().then(function (text) {
                                                answerListItem['Answer'] = text.trim();
                                                doneParsingTd();
                                            });
                                        },
                                        function (doneParsingTd) {
                                            tds[5].getText().then(function (text) {
                                                answerListItem['Answer ID'] = text.trim();
                                                doneParsingTd();
                                            });
                                        }
                                    ], function () {
                                        answerListArray.push(answerListItem);
                                        doneOneTr();
                                    });
                                } else {
                                    doneOneTr();
                                }


                            });
                        }, function doneAllTrs() {
                            done();
                        });
                    }
                ], function () {
                    next();
                });
            });
        }
    ], function () {
        obj[sectionName][sectionName] = answerListObj;
        cb();
    });
};