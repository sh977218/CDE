const async = require('async');
const webdriver = require('selenium-webdriver');
const By = webdriver.By;

const MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;

const ParseLoincNameTable = require('./ParseLoincNameTable');
const ParsePanelHierarchyTable = require('./ParsePanelHierarchyTable');
const ParseNameTable = require('./ParseNameTable');
const ParseDefinitionDescriptionsTable = require('./ParseDefinitionDescriptionsTable');
const ParsePartTable = require('./ParsePartTable');
const ParseBasicAttributesTable = require('./ParseBasicAttributesTable');
const ParseHL7AttributesTable = require('./ParseHL7AttributesTable');
const ParseSubmittersInformationTable = require('./ParseSubmittersInformationTable');
const ParseMemberOfThesePanelsTable = require('./ParseMemberOfThesePanelsTable');
const ParsingAnswerListTable = require('./ParseAnswerListTable');
const ParseSurveyQuestionTable = require('./ParseSurveyQuestionTable');
const ParseLanguageVariantsTable = require('./ParseLanguageVariantsTable');
const ParseRelatedNamesTable = require('./ParseRelatedNamesTable');
const ParseExampleUnitsTable = require('./ParseExampleUnitsTable');
const Parse3rdPartyCopyrightTable = require('./Parse3rdPartyCopyrightTable');
const ParseCopyrightTable = require('./ParseCopyrightTable');
const ParseWebContentTable = require('./ParseWebContentTable');
const ParseArticleTable = require('./ParseArticleTable');
const ParseCopyrightText = require('./ParseCopyrightText');
const ParseCopyrightNotice = require('./ParseCopyrightNotice');
const ParsingVersion = require('./ParseVersion');
const ParseQuestion = require('./ParseQuestion');
const CheckLformViewer = require('./CheckLformViewer');

let loincCount = 0;

const url_prefix = 'http://r.details.loinc.org/LOINC/';
const url_postfix = '.html';
const url_postfix_para = '?sections=Comprehensive';

const tasks = [
    {
        sectionName: 'PANEL HIERARCHY',
        function: ParsePanelHierarchyTable.parsePanelHierarchyTable,
        xpath: 'html/body/div[@class="Section1"]/table[.//th[contains(text(),"PANEL HIERARCHY")]]/following-sibling::table[1]'
    },
    {
        sectionName: 'LOINC NAME',
        function: ParseLoincNameTable.parseLoincNameTable,
        xpath: '((//table)[1])'
    },
    {
        sectionName: 'NAME',
        function: ParseNameTable.parseNameTable,
        xpath: 'html/body/div/table[.//th[text()="NAME"]]'
    },
/*
    {
        sectionName: 'COPYRIGHT NOTICE',
        function: ParseCopyrightNotice.parseCopyrightNotice,
        xpath: 'html/body/div/table[.//tr[contains(.,"NOTICE") and contains(.,"COPYRIGHT")]]'
    },
*/
    {
        sectionName: 'PART DEFINITION/DESCRIPTION(S)',
        function: ParseDefinitionDescriptionsTable.parseDefinitionDescriptionsTable,
        xpath: 'html/body/div[@class="Section0"]/table[.//th[text()="PART DEFINITION/DESCRIPTION(S)"]]'
    },
    {
        sectionName: 'TERM DEFINITION/DESCRIPTION(S)',
        function: ParseDefinitionDescriptionsTable.parseDefinitionDescriptionsTable,
        xpath: 'html/body/div[@class="Section0"]/table[.//th[text()="TERM DEFINITION/DESCRIPTION(S)"]]'
    },
    {
        sectionName: 'PARTS',
        function: ParsePartTable.parsePartTable,
        xpath: '//*[@class="Section7000"]/div/table'
    }, {
        sectionName: 'FORM CODING INSTRUCTIONS',
        function: ParseDefinitionDescriptionsTable.parseDefinitionDescriptionsTable,
        xpath: 'html/body/div/table[.//th[contains(node(),"FORM CODING INSTRUCTIONS")]]'
    },
    {
        sectionName: 'BASIC ATTRIBUTES',
        function: ParseBasicAttributesTable.parseBasicAttributesTable,
        xpath: 'html/body/div/table[.//th[text()="BASIC ATTRIBUTES"]]'
    },
    {
        sectionName: 'HL7 ATTRIBUTES',
        function: ParseHL7AttributesTable.parseHL7AttributesTable,
        xpath: 'html/body/div/table[.//th[contains(node(),"HL7 ATTRIBUTES")]]'
    },
    {
        sectionName: 'SUBMITTER\'S INFORMATION',
        function: ParseSubmittersInformationTable.parseSubmittersInformationTable,
        xpath: 'html/body/div/table[.//th[text()="SUBMITTER\'S INFORMATION"]]'
    },
    {
        sectionName: 'MEMBER OF THESE PANELS',
        function: ParseMemberOfThesePanelsTable.parseMemberOfThesePanelsTable,
        xpath: 'html/body/div/table[.//th[text()="MEMBER OF THESE PANELS"]]'
    },
    {
        sectionName: 'LANGUAGE VARIANTS',
        function: ParseLanguageVariantsTable.parseLanguageVariantsTable,
        xpath: 'html/body/div/table[.//th[text()="LANGUAGE VARIANTS"]]'
    },
    {
        sectionName: 'RELATED NAMES',
        function: ParseRelatedNamesTable.parseRelatedNamesTable,
        xpath: 'html/body/div/table[.//th[text()="RELATED NAMES"]]'
    },
    {
        sectionName: 'EXAMPLE UNITS',
        function: ParseExampleUnitsTable.parseExampleUnitsTable,
        xpath: 'html/body/div/table[.//th[text()="EXAMPLE UNITS"]]'
    },
/*
    {
        sectionName: '3rd PARTY COPYRIGHT',
        function: Parse3rdPartyCopyrightTable.parse3rdPartyCopyrightTable,
        xpath: '/html/body/div/table[.//th[text()="3rd PARTY COPYRIGHT"]]'
    },
*/
    {
        sectionName: 'COPYRIGHT',
        function: ParseCopyrightTable.parseCopyrightTable,
        xpath: '/html/body/div/table[.//th[text()="COPYRIGHT"]]'
    },
    {
        sectionName: 'EXAMPLE ANSWER LIST',
        function: ParsingAnswerListTable.parseAnswerListTable,
        xpath: 'html/body/div[@class="Section80000"]/table[.//th[contains(node(),"EXAMPLE ANSWER LIST")]]'
    },
    {
        sectionName: 'NORMATIVE ANSWER LIST',
        function: ParsingAnswerListTable.parseAnswerListTable,
        xpath: 'html/body/div[@class="Section80000"]/table[.//th[contains(node(),"NORMATIVE ANSWER LIST")]]'
    },
    {
        sectionName: 'PREFERRED ANSWER LIST',
        function: ParsingAnswerListTable.parseAnswerListTable,
        xpath: 'html/body/div[@class="Section80000"]/table[.//th[contains(node(),"PREFERRED ANSWER LIST")]]'
    },
    {
        sectionName: 'SURVEY QUESTION',
        function: ParseSurveyQuestionTable.parseSurveyQuestionTable,
        xpath: 'html/body/div/table[.//th[contains(node(),"SURVEY")]]'
    },
    {
        sectionName: 'WEB CONTENT',
        function: ParseWebContentTable.parseWebContentTable,
        xpath: 'html/body/div/table[.//th[text()="WEB CONTENT"]]'
    },
    {
        sectionName: 'ARTICLE',
        function: ParseArticleTable.parseArticleTable,
        xpath: 'html/body/div/table[.//th[text()="ARTICLE"]]'
    },
    {
        sectionName: 'COPYRIGHT TEXT',
        function: ParseCopyrightText.parseCopyrightText,
        xpath: '//p[@class="copyright"][1]'
    },
    {
        sectionName: 'VERSION',
        function: ParsingVersion.parseVersion,
        xpath: '//p[contains(text(),"Generated from LOINC version")]'
    }
];
const specialTasks = [
    {
        function: ParseQuestion.parseQuestion
    },
    {
        function: CheckLformViewer.checkLformViewer
    }
];
let currentVersion = '2.58';

exports.setCurrentVersion = function (v) {
    currentVersion = v;
};

function logMessage(obj, messange) {
    obj['info'] = obj['info'] + messange + '\n';
}

function doTask(driver, task, obj, cb) {
    driver.findElements(By.xpath(task.xpath)).then(function (elements) {
        if (elements && elements.length === 0) {
            let message = 'Cannot find ' + task.sectionName + ' for loinc: ' + obj.loincId;
            logMessage(obj, message);
            cb();
        } else if (elements && elements.length > 1) {
            let message = 'find ' + elements.length + ' ' + task.sectionName + ' for loinc: ' + obj.loincId;
            logMessage(obj, message);
            cb();
        } else if (elements && elements.length === 1) {
            elements[0].getAttribute('outerHTML').then(function (html) {
                obj[task.sectionName] = {
                    HTML: html
                };
                task.function(obj, task, elements[0], cb);
            });
        } else {
            logMessage(obj, 'Unknown error.');
            cb();
        }
    });
}

exports.runArray = function (array, orgName, doneItem, doneArray) {
    ParsePanelHierarchyTable.setOrgName(orgName);
    let results = [];
    async.series([
        function () {
            let driver = new webdriver.Builder().forBrowser('chrome').build();
            async.forEachSeries(array, function (loincId, doneOneLoinc) {
                MigrationLoincModel.find({
                    loincId: loincId,
                    version: currentVersion
                }).exec(function (error, existingLoincs) {
                    if (error) throw error;
                    if (existingLoincs.length === 0) {
                        let url = url_prefix + loincId.trim() + url_postfix + url_postfix_para;
                        driver.get(url).then(function () {
                            let obj = {URL: url, orgName: orgName, loincId: loincId, info: ''};
                            async.forEach(tasks, function (task, doneOneTask) {
                                doTask(driver, task, obj, doneOneTask);
                            }, function doneAllTasks() {
                                async.forEachSeries(specialTasks, function (specialTask, doneOneSpecialTask) {
                                    if (obj['PANEL HIERARCHY']) {
                                        specialTask.function(driver, obj, doneOneSpecialTask);
                                    }
                                    else {
                                        doneOneSpecialTask();
                                    }
                                }, function doneAllSpecialTasks() {
                                    loincCount++;
                                    console.log('loincCount: ' + loincCount);
                                    results.push(obj);
                                    doneItem(obj, doneOneLoinc);
                                });
                            });
                        });
                    } else {
                        console.log('loinc id: ' + loincId + ' exists');
                        doneOneLoinc();
                    }
                });
            }, function doneAllLoinc() {
                console.log('Finished all. loincCount: ' + loincCount);
                driver.close();
                if (doneArray) doneArray(results);
                else process.exit(1);
            });
        }
    ]);
};