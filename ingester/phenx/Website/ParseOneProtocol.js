var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var async = require('async');
var driver = new webdriver.Builder().forBrowser('chrome').build();

function parseOneSection(protocol, key, id, done) {
    if (id.indexOf('STANDARDS') > -1) {
        var standards = [];
        driver.findElements(webdriver.By.xpath("//*[@id='" + id + "']//table/tbody/tr[td]")).then(function (trs) {
            async.eachSeries(trs, function (tr, doneOneStandardsTr) {
                var standard = {};
                tr.findElements(webdriver.By.css('td')).then(function (tds) {
                    async.parallel({
                        parsingStandard: function (doneParsingStandard) {
                            tds[0].getText().then(function (text) {
                                standard['Standard'] = text;
                                doneParsingStandard();
                            });
                        },
                        parsingName: function (doneParsingName) {
                            tds[1].getText().then(function (text) {
                                standard['Name'] = text;
                                doneParsingName();
                            });
                        },
                        parsingId: function (doneParsingId) {
                            tds[2].getText().then(function (text) {
                                standard['ID'] = text;
                                doneParsingId();
                            });
                        },
                        parsingSource: function (doneParsingSource) {
                            var source = {};
                            tds[3].getText().then(function (text) {
                                source.text = text.trim();
                                if (text.trim() === 'LOINC') {
                                    tds[3].findElement(webdriver.By.css('a')).then(function (a) {
                                        a.getAttribute('href').then(function (href) {
                                            source.href = href.trim();
                                            var form = {
                                                classification: protocol.classification
                                            };
                                            driver3.get(source['href']);
                                            driver3.findElements(webdriver.By.xpath("/html/body/div[2]/table[2]/tbody/tr[.//a]")).then(function (temp) {
                                                if (temp.length > 0) {
                                                    var elements = [];
                                                    var i = 0;
                                                    async.eachSeries(temp, function (tr, doneOneTr) {
                                                        var element = {};
                                                        i++;
                                                        async.parallel({
                                                            parsingFormAndElementName: function (doneParsingFormAndElementName) {
                                                                tr.findElements(webdriver.By.css('td')).then(function (tds) {
                                                                    if (tds.length > 0) {
                                                                        if (i === 1) {
                                                                            tds[2].getText().then(function (elementNameText) {
                                                                                form['name'] = elementNameText.trim();
                                                                                doneParsingFormAndElementName();
                                                                            });
                                                                        }
                                                                        else {
                                                                            tds[2].getText().then(function (elementNameText) {
                                                                                element['name'] = elementNameText.trim();
                                                                                doneParsingFormAndElementName();
                                                                            });
                                                                        }
                                                                    }
                                                                    else {
                                                                        doneParsingFormAndElementName();
                                                                    }
                                                                });
                                                            },
                                                            parsingLinks: function (doneParsingLink) {
                                                                tr.findElement(webdriver.By.css('a')).getAttribute('href').then(function (elementHrefText) {
                                                                    if (i === 1) {
                                                                        form['href'] = elementHrefText.trim();
                                                                    }
                                                                    else {
                                                                        element['href'] = elementHrefText.trim();
                                                                    }
                                                                    doneParsingLink();
                                                                });
                                                            },
                                                            parsingLoincId: function (doneParsingLoinc) {
                                                                tr.findElement(webdriver.By.css('a')).getText().then(function (elementHrefText) {
                                                                    if (i === 1) {
                                                                        form['loincId'] = elementHrefText.trim();
                                                                    }
                                                                    else {
                                                                        element['loincId'] = elementHrefText.trim();
                                                                    }
                                                                    doneParsingLoinc();
                                                                });
                                                            }
                                                        }, function doneAllHref() {
                                                            if (i !== 1)
                                                                elements.push(element);
                                                            doneOneTr();
                                                        });
                                                    }, function doneAllTrs() {
                                                        async.eachSeries(elements, function (ele, doneOneEle) {
                                                            ele['classification'] = form['classification'];
                                                            var eleHref = ele['href'];
                                                            driver4.get(eleHref);
                                                            driver4.findElements(webdriver.By.xpath("/html/body/div[2]/table[1]/tbody/tr[1]/th/a")).then(function (isPanel) {
                                                                if (isPanel.length > 0) {
                                                                    ele['type'] = 'Panel';
                                                                    doneOneEle();
                                                                }
                                                                else {
                                                                    ele['type'] = 'Question';
                                                                    doneOneEle();
                                                                }
                                                            });
                                                        }, function doneAllEles() {
                                                            form['elements'] = elements;
                                                            protocol['form'] = form;
                                                            standard['Source'] = source;
                                                            doneParsingSource();
                                                        });
                                                    });

                                                }
                                                else {
                                                    protocol['form'] = form;
                                                    standard['Source'] = source;
                                                    doneParsingSource();
                                                }

                                            });

                                        });
                                    });
                                } else {
                                    standard['Source'] = source;
                                    doneParsingSource();
                                }
                            });
                        }
                    }, function doneAllStandardsTds() {
                        standards.push(standard);
                        doneOneStandardsTr();
                    });
                });
            }, function doneAllStandardsTrs() {
                protocol['Standards'] = standards;
                done();
            });
        });
    }
    else if (id.indexOf('PROTOCOL_TEXT') > -1 || newId.indexOf('Requirements') > -1 || newId.indexOf('SPECIFIC_INSTRUCTIONS') > -1) {
        driver.findElements(webdriver.By.xpath("//*[@id='" + newId + "']")).then(function (temp) {
            if (temp.length > 0) {
                temp[0].getOuterHtml().then(function (html) {
                    protocol[key.trim()] = html;
                    done();
                });
            }
            else
                done();
        });
    }
    else {
        driver.findElement(webdriver.By.id(newId)).getText().then(function (text) {
            protocol[key.trim()] = text;
            done();
        });
    }
}

exports.parseProtocol = function (measure, link, cb) {
    driver.get(link);
    driver.findElement(By.id('button_showfull')).click().then(function () {
        var labelXpath = "//*[contains(@id,'label')]";
        driver.findElements(By.xpath(labelXpath)).then(function (labels) {
            async.eachSeries(labels, function (label, doneOneLabel) {
                label.getText().then(function (key) {
                    label.getAttribute('id').then(function (id) {
                        var newId = id.trim().replace('label', 'element');
                        var protocol = {};
                        parseOneSection(protocol, key, newId, function () {
                            measure.protocols.push(protocol);
                            doneOneLabel();
                        });
                    });
                });
            }, function donAllLabels() {
            })
        });
    });
};