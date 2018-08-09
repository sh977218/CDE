var async = require('async');
var By = require('selenium-webdriver').By;

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
                } else {
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
                        } else {
                            done();
                        }
                    },
                    function (done) {
                        var thMapping = {};
                        trs[0].findElements(By.css('th')).then(function (ths) {
                            var thIndex = 0;
                            async.forEachSeries(ths, function (th, doneOneTh) {
                                th.getText().then(function (text) {
                                    if (text.trim().length > 0) {
                                        thMapping[text.trim().replace('\n', ' ')] = thIndex;
                                    }
                                    thIndex++;
                                    doneOneTh();
                                })
                            }, function doneAllThs() {
                                trs.shift();
                                async.forEach(trs, function (tr, doneOneTr) {
                                    var answerListItem = {};
                                    tr.findElements(By.xpath('td')).then(function (tds) {
                                        async.forEach(Object.keys(thMapping), function (key, doneOneKey) {
                                            var index = thMapping[key];
                                            tds[index].getText().then(function (text) {
                                                answerListItem[key] = text.trim();
                                                doneOneKey();
                                            });
                                        }, function doneAllKeys() {
                                            answerListArray.push(answerListItem);
                                            doneOneTr();
                                        });
                                    });
                                }, function doneAllTrs() {
                                    done();
                                });
                            })
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