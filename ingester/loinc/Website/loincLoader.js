const webdriver = require('selenium-webdriver');
const By = webdriver.By;

const Form = require('../../../server/form/mongo-form').Form;
const CreateForm = require('../Form/CreateForm');
const MergeForm = require('../Form/MergeForm');

const ParseLoincNameTable = require('./ParseLoincNameTable');
const ParseLoincIdTable = require('./ParseLoincIdTable');
const ParsePanelHierarchyTable = require('./ParsePanelHierarchyTable');
const ParseNameTable = require('./NameTable/ParseNameTable');
const ParseTermDefinitionDescriptionsTable = require('./ParseTermDefinitionDescriptionsTable');
const ParseFormCodingInstructionsTable = require('./ParseFormCodingInstructionsTable');
const ParsePartDefinitionDescriptionsTable = require('./ParsePartDefinitionDescriptionsTable');
const ParsePartTable = require('./ParsePartTable');
const ParseBasicAttributesTable = require('./ParseBasicAttributesTable');
const ParseHL7AttributesTable = require('./ParseHL7AttributesTable');
const ParseSubmittersInformationTable = require('./ParseSubmittersInformationTable');
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
        sectionName: 'LOINC Id',
        function: ParseLoincIdTable.parseLoincIdTable,
        xpath: '((//table)[1])'
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

    {
        sectionName: 'COPYRIGHT NOTICE',
        function: ParseCopyrightNotice.parseCopyrightNotice,
        xpath: 'html/body/div/table[.//tr[contains(.,"NOTICE") and contains(.,"COPYRIGHT")]]'
    },
    {
        sectionName: 'PART DEFINITION/DESCRIPTION(S)',
        function: ParsePartDefinitionDescriptionsTable.parsePartDefinitionDescriptionsTable,
        xpath: 'html/body/div[@class="Section0"]/table[.//th[text()="PART DEFINITION/DESCRIPTION(S)"]]'
    },
    {
        sectionName: 'TERM DEFINITION/DESCRIPTION(S)',
        function: ParseTermDefinitionDescriptionsTable.parseTermDefinitionDescriptionsTable,
        xpath: 'html/body/div[@class="Section0"]/table[.//th[text()="TERM DEFINITION/DESCRIPTION(S)"]]'
    },
    {
        sectionName: 'PARTS',
        function: ParsePartTable.parsePartTable,
        xpath: '(//*[@class="Section7000"]/div/table)[1]'
    },
    {
        sectionName: 'FORM CODING INSTRUCTIONS',
        function: ParseFormCodingInstructionsTable.parseFormCodingInstructionsTable,
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

    {
        sectionName: '3rd PARTY COPYRIGHT',
        function: Parse3rdPartyCopyrightTable.parse3rdPartyCopyrightTable,
        xpath: '/html/body/div/table[.//th[text()="3rd PARTY COPYRIGHT"]]'
    },
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

exports.runOneLoinc = loincId => {
    return new Promise(async (resolve, reject) => {
        let driver = new webdriver.Builder().forBrowser('chrome').build();
        let url = url_prefix + loincId.trim() + url_postfix + url_postfix_para;
        await driver.get(url);
        let loinc = {URL: url, loincId: loincId};
        for (let task of tasks) {
            let sectionName = task.sectionName;
            let elements = await driver.findElements(By.xpath(task.xpath));
            if (elements && elements.length === 1 && task.function) {
                await task.function(driver, loincId, elements[0], result => {
                    loinc[sectionName] = result;
                });
            }
        }
        driver.close();
        resolve(loinc);
    })
};

exports.runOneForm = (loinc, orgInfo) => {
    return new Promise(async (resolve, reject) => {
        let formCond = {
            archived: false,
            source: 'LOINC',
            "registrationState.registrationStatus": {$not: /Retired/},
            'ids.id': loinc.loincId
        };
        let existingForm = await Form.findOne(formCond);
        let newForm = await CreateForm.createForm(loinc, orgInfo);
        if (!existingForm) {
            existingForm = await new Form(newForm).save();
        } else {
            await MergeForm.mergeForm(newForm, existingForm, orgInfo.stewardOrgName);
            existingForm.updated = new Date().toJSON();
        }
        resolve(existingForm);
    })
};
