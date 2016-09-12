var async = require('async');
var By = require('selenium-webdriver').By;

exports.parseNameTable = function (obj, task, element, cb) {
    var sectionName = task.sectionName;
    obj[sectionName][sectionName] = {};
    element.findElements(By.xpath('tbody/tr')).then(function (trs) {
        async.parallel([
            function (cb) {
                trs[1].findElements(By.xpath('td')).then(function (tds) {
                    tds[2].findElements(By.xpath('table/tbody/tr')).then(function (innerTrs) {
                        if (innerTrs) {
                            obj[sectionName][sectionName]['Fully-Specified Name'] = {};
                            innerTrs[1].findElements(By.xpath('td')).then(function (innerTds) {
                                async.parallel([
                                    function (innerCb) {
                                        innerTds[0].getText().then(function (text) {
                                            obj[sectionName][sectionName]['Fully-Specified Name']['Component'] = text.trim();
                                            innerCb();
                                        });
                                    },
                                    function (innerCb) {
                                        innerTds[1].getText().then(function (text) {
                                            obj[sectionName][sectionName]['Fully-Specified Name']['Property'] = text.trim();
                                            innerCb();
                                        });
                                    },
                                    function (innerCb) {
                                        innerTds[2].getText().then(function (text) {
                                            obj[sectionName][sectionName]['Fully-Specified Name']['Time'] = text.trim();
                                            innerCb();
                                        });
                                    },
                                    function (innerCb) {
                                        innerTds[3].getText().then(function (text) {
                                            obj[sectionName][sectionName]['Fully-Specified Name']['System'] = text.trim();
                                            innerCb();
                                        });
                                    },
                                    function (innerCb) {
                                        innerTds[4].getText().then(function (text) {
                                            obj[sectionName][sectionName]['Fully-Specified Name']['Scale'] = text.trim();
                                            innerCb();
                                        });
                                    },
                                    function (innerCb) {
                                        innerTds[5].getText().then(function (text) {
                                            obj[sectionName][sectionName]['Fully-Specified Name']['Method'] = text.trim();
                                            innerCb();
                                        });
                                    }
                                ], function () {
                                    cb();
                                });
                            });
                        } else {
                            tds[3].getText().then(function (text) {
                                obj[sectionName][sectionName]['Fully-Specified Name'] = text.trim();
                                cb();
                            });
                        }
                    });
                });
            }, function (cb) {
                trs[2].findElements(By.xpath('td')).then(function (tds) {
                    tds[2].getText().then(function (text) {
                        obj[sectionName][sectionName]['Long Common Name'] = text.trim();
                        cb();
                    });
                });
            },
            function (cb) {
                if (trs[3]) {
                    trs[3].findElements(By.xpath('td')).then(function (tds) {
                        tds[2].getText().then(function (text) {
                            obj[sectionName][sectionName]['Shortname'] = text.trim();
                            cb();
                        });
                    });
                } else {
                    cb();
                }
            }
        ], function () {
            cb();
        });
    });
};