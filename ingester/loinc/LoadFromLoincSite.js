var async = require('async');
var webdriver = require('selenium-webdriver');
var By = webdriver.By;

var MigrationLoincModel = require('../createConnection').MigrationLoincModel;

var ParseLoincNameTable = require('./ParseLoincNameTable');
var ParseNameTable = require('./ParseNameTable');
var ParseDefinitionDescriptionsTable = require('./ParseDefinitionDescriptionsTable');
var ParsePartTable = require('./ParsePartTable');
var ParseBasicAttributesTable = require('./ParseBasicAttributesTable');
var ParseSubmittersInformationTable = require('./ParseSubmittersInformationTable');
var ParseMemberOfThesePanelsTable = require('./ParseMemberOfThesePanelsTable');
var ParsingAnswerListTable = require('./ParseAnswerListTable');
var ParseSurveyQuestionTable = require('./ParseSurveyQuestionTable');
var ParseLanguageVariantsTable = require('./ParseLanguageVariantsTable');
var ParseRelatedNamesTable = require('./ParseRelatedNamesTable');
var ParseExampleUnitsTable = require('./ParseExampleUnitsTable');
var ParseWebContentTable = require('./ParseWebContentTable');
var ParseArticleTable = require('./ParseArticleTable');
var ParseCopyright = require('./ParseCopyright');
var ParsingVersion = require('./ParseVersion');

var loincCount = 0;

var url_prefix = 'http://r.details.loinc.org/LOINC/';
var url_postfix = '.html';
var url_postfix_para = '?sections=Comprehensive';

var tasks = [
    {
        sectionName: 'LOINC NAME',
        function: ParseLoincNameTable.parseLoincNameTable,
        xpath: '((//table)[1])'
    },
    {
        sectionName: 'NAME',
        function: ParseNameTable.parseNameTable,
        xpath: '//*[@class="Section1000000F00"]/table'
    },
    {
        sectionName: 'PART DEFINITION/DESCRIPTION(S)',
        function: ParseDefinitionDescriptionsTable.parseDefinitionDescriptionsTable,
        xpath: '//*[@class="Section0"]/table[.//th[contains(text(),"PART DEFINITION/DESCRIPTION(S)")]]'
    },
    {
        sectionName: 'TERM DEFINITION/DESCRIPTION(S)',
        function: ParseDefinitionDescriptionsTable.parseDefinitionDescriptionsTable,
        xpath: '//div[@class="Section0"]/table[.//th[contains(text(),"TERM DEFINITION/DESCRIPTION(S)")]]'
    },
    {
        sectionName: 'PARTS',
        function: ParsePartTable.parsePartTable,
        xpath: '//*[@class="Section7000"]/div/table'
    },
    {
        sectionName: 'BASIC ATTRIBUTES',
        function: ParseBasicAttributesTable.parseBasicAttributesTable,
        xpath: '//table[.//th[contains(text(),"BASIC ATTRIBUTES")]]'
    },
    {
        sectionName: 'SUBMITTER\'S INFORMATION',
        function: ParseSubmittersInformationTable.parseSubmittersInformationTable,
        xpath: '//table[.//th[contains(text(),"SUBMITTER\'S INFORMATION")]]'
    },
    {
        sectionName: 'MEMBER OF THESE PANELS',
        function: ParseMemberOfThesePanelsTable.parseMemberOfThesePanelsTable,
        xpath: '//table[.//th[contains(text(),"MEMBER OF THESE PANELS")]]'
    },
    {
        sectionName: 'LANGUAGE VARIANTS',
        function: ParseLanguageVariantsTable.parseLanguageVariantsTable,
        xpath: '//table[.//th[contains(text(),"LANGUAGE VARIANTS")]]'
    },
    {
        sectionName: 'RELATED NAMES',
        function: ParseRelatedNamesTable.parseRelatedNamesTable,
        xpath: '//table[.//th[contains(text(),"RELATED NAMES")]]'
    },
    {
        sectionName: 'EXAMPLE UNITS',
        function: ParseExampleUnitsTable.parseExampleUnitsTable,
        xpath: '//table[.//th[contains(text(),"EXAMPLE UNITS")]]'
    },
    {
        sectionName: 'EXAMPLE ANSWER LIST',
        function: ParsingAnswerListTable.parseAnswerListTable,
        xpath: '//table[.//th[contains(text(),"EXAMPLE ANSWER LIST")]]'
    },
    {
        sectionName: 'NORMATIVE ANSWER LIST',
        function: ParsingAnswerListTable.parseAnswerListTable,
        xpath: '//*[@class="Section80000"]/table[.//th[contains(node(),"NORMATIVE ANSWER LIST")]]'
    },
    {
        sectionName: 'PREFERRED ANSWER LIST',
        function: ParsingAnswerListTable.parseAnswerListTable,
        xpath: '//*[@class="Section80000"]/table[.//th[contains(node(),"PREFERRED ANSWER LIST")]]'
    },
    {
        sectionName: 'SURVEY QUESTION',
        function: ParseSurveyQuestionTable.parseSurveyQuestionTable,
        xpath: '//table[.//th[contains(text(),"SURVEY QUESTION")]]'
    },
    {
        sectionName: 'WEB CONTENT',
        function: ParseWebContentTable.parseWebContentTable,
        xpath: '//table[.//th[contains(text(),"WEB CONTENT")]]'
    },
    {
        sectionName: 'ARTICLE',
        function: ParseArticleTable.parseArticleTable,
        xpath: '//table[.//th[contains(text(),"ARTICLE")]]'
    },
    {
        sectionName: 'COPYRIGHT',
        function: ParseCopyright.parseCopyright,
        xpath: '//p[@class="copyright"][1]'
    },
    {
        sectionName: 'VERSION',
        function: ParsingVersion.parseVersion,
        xpath: '//p[contains(text(),"Generated from LOINC version")]'
    }
];

function logMessage(obj, messange) {
    obj['info'] = obj['info'] + messange + '\n';
}

function doTask(driver, task, obj, cb) {
    driver.findElements(By.xpath(task.xpath)).then(function (elements) {
        if (elements && elements.length === 0) {
            var message = 'Cannot find ' + task.sectionName + ' for loinc: ' + obj.loincId;
            logMessage(obj, message);
            cb();
        } else if (elements && elements.length > 1) {
            var message = 'find ' + elements.length + ' ' + task.sectionName + ' for loinc: ' + obj.loincId;
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

var results = [];

exports.runArray = function (array, doneItem, doneArray) {
    async.series([
        function (doneRemoveMigrationLoinc) {
            MigrationLoincModel.remove({}, function (removeMigrationLoincError) {
                if (removeMigrationLoincError) throw removeMigrationLoincError;
                console.log('Removed migration loinc collection.');
                doneRemoveMigrationLoinc();
            });
        },
        function () {
            var driver = new webdriver.Builder().forBrowser('chrome').build();
            async.forEach(array, function (loincId, doneOneLoinc) {
                var url = url_prefix + loincId.trim() + url_postfix + url_postfix_para;
                driver.get(url).then(function () {
                    var obj = {URL: url, loincId: loincId, info: ''};
                    async.forEach(tasks, function (task, doneOneTask) {
                        doTask(driver, task, obj, doneOneTask);
                    }, function doneAllTasks() {
                        loincCount++;
                        console.log('loincCount: ' + loincCount);
                        results.push(obj);
                        doneItem(obj);
                        doneOneLoinc();
                    });
                });
            }, function doneAllLoinc() {
                console.log('Finished all. loincCount: ' + loincCount);
                if (doneArray) doneArray(results);
                else process.exit(1);
            });
        }
    ]);
};