const {Builder, By} = require('selenium-webdriver');
require('chromedriver');

import { parsePanelHierarchyTable } from 'ingester/loinc/Website/ParsePanelHierarchyTable';
import { parseLoincIdTable } from 'ingester/loinc/Website/ParseLoincIdTable';
import { parseLoincNameTable } from 'ingester/loinc/Website/ParseLoincNameTable';
import { parse3rdPartyCopyrightTable } from 'ingester/loinc/Website/Parse3rdPartyCopyrightTable';
import { parseNameTable } from 'ingester/loinc/Website/NameTable/ParseNameTable';
import { parseCopyrightNotice } from 'ingester/loinc/Website/ParseCopyrightNotice';
import { parsePartDefinitionDescriptionsTable } from 'ingester/loinc/Website/ParsePartDefinitionDescriptionsTable';
import { parseTermDefinitionDescriptionsTable } from 'ingester/loinc/Website/ParseTermDefinitionDescriptionsTable';
import { parsePartTable } from 'ingester/loinc/Website/ParsePartTable';
import { parseFormCodingInstructionsTable } from 'ingester/loinc/Website/ParseFormCodingInstructionsTable';
import { parseBasicAttributesTable } from 'ingester/loinc/Website/ParseBasicAttributesTable';
import { parseHL7AttributesTable } from 'ingester/loinc/Website/ParseHL7AttributesTable';
import { parseSubmittersInformationTable } from 'ingester/loinc/Website/ParseSubmittersInformationTable';
import { parseLanguageVariantsTable } from 'ingester/loinc/Website/ParseLanguageVariantsTable';
import { parseRelatedNamesTable } from 'ingester/loinc/Website/ParseRelatedNamesTable';
import { parseExampleUnitsTable } from 'ingester/loinc/Website/ParseExampleUnitsTable';
import { parseCopyrightTable } from 'ingester/loinc/Website/ParseCopyrightTable';
import { parseAnswerListTable } from 'ingester/loinc/Website/ParseAnswerListTable';
import { parseSurveyQuestionTable } from 'ingester/loinc/Website/ParseSurveyQuestionTable';
import { parseWebContentTable } from 'ingester/loinc/Website/ParseWebContentTable';
import { parseArticleTable } from 'ingester/loinc/Website/ParseArticleTable';
import { parseCopyrightText } from 'ingester/loinc/Website/ParseCopyrightText';
import { parseVersion } from 'ingester/loinc/Website/ParseVersion';

const tasks = [
    {
        sectionName: 'PANEL HIERARCHY',
        function: parsePanelHierarchyTable,
        xpath: 'html/body/div[@class="Section1"]/table[.//th[contains(text(),"PANEL HIERARCHY")]]/following-sibling::table[1]'
    },
    {
        sectionName: 'LOINC Id',
        function: parseLoincIdTable,
        xpath: '((//table)[1])'
    },
    {
        sectionName: 'LOINC NAME',
        function: parseLoincNameTable,
        xpath: '((//table)[1])'
    },
    {
        sectionName: 'NAME',
        function: parseNameTable,
        xpath: 'html/body/div/table[.//th[text()="NAME"]]'
    },

    {
        sectionName: 'COPYRIGHT NOTICE',
        function: parseCopyrightNotice,
        xpath: 'html/body/div/table[.//tr[contains(.,"NOTICE") and contains(.,"COPYRIGHT")]]'
    },
    {
        sectionName: 'PART DEFINITION/DESCRIPTION(S)',
        function: parsePartDefinitionDescriptionsTable,
        xpath: 'html/body/div[@class="Section0"]/table[.//th[text()="PART DEFINITION/DESCRIPTION(S)"]]'
    },
    {
        sectionName: 'TERM DEFINITION/DESCRIPTION(S)',
        function: parseTermDefinitionDescriptionsTable,
        xpath: 'html/body/div[@class="Section0"]/table[.//th[text()="TERM DEFINITION/DESCRIPTION(S)"]]'
    },
    {
        sectionName: 'PARTS',
        function: parsePartTable,
        xpath: '(//*[@class="Section7000"]/div/table)[1]'
    },
    {
        sectionName: 'FORM CODING INSTRUCTIONS',
        function: parseFormCodingInstructionsTable,
        xpath: 'html/body/div/table[.//th[contains(node(),"FORM CODING INSTRUCTIONS")]]'
    },
    {
        sectionName: 'BASIC ATTRIBUTES',
        function: parseBasicAttributesTable,
        xpath: 'html/body/div/table[.//th[text()="BASIC ATTRIBUTES"]]'
    },
    {
        sectionName: 'HL7 ATTRIBUTES',
        function: parseHL7AttributesTable,
        xpath: 'html/body/div/table[.//th[contains(node(),"HL7 ATTRIBUTES")]]'
    },
    {
        sectionName: 'SUBMITTER\'S INFORMATION',
        function: parseSubmittersInformationTable,
        xpath: 'html/body/div/table[.//th[text()="SUBMITTER\'S INFORMATION"]]'
    },

    {
        sectionName: 'LANGUAGE VARIANTS',
        function: parseLanguageVariantsTable,
        xpath: 'html/body/div/table[.//th[text()="LANGUAGE VARIANTS"]]'
    },
    {
        sectionName: 'RELATED NAMES',
        function: parseRelatedNamesTable,
        xpath: 'html/body/div/table[.//th[text()="RELATED NAMES"]]'
    },

    {
        sectionName: 'EXAMPLE UNITS',
        function: parseExampleUnitsTable,
        xpath: 'html/body/div/table[.//th[text()="EXAMPLE UNITS"]]'
    },
    {
        sectionName: '3rd PARTY COPYRIGHT',
        function: parse3rdPartyCopyrightTable,
        xpath: '/html/body/div/table[.//th[text()="3rd PARTY COPYRIGHT"]]'
    },
    {
        sectionName: 'COPYRIGHT',
        function: parseCopyrightTable,
        xpath: '/html/body/div/table[.//th[text()="COPYRIGHT"]]'
    },
    {
        sectionName: 'EXAMPLE ANSWER LIST',
        function: parseAnswerListTable,
        xpath: 'html/body/div[@class="Section80000"]/table[.//th[contains(node(),"EXAMPLE ANSWER LIST")]]'
    },
    {
        sectionName: 'NORMATIVE ANSWER LIST',
        function: parseAnswerListTable,
        xpath: 'html/body/div[@class="Section80000"]/table[.//th[contains(node(),"NORMATIVE ANSWER LIST")]]'
    },
    {
        sectionName: 'PREFERRED ANSWER LIST',
        function: parseAnswerListTable,
        xpath: 'html/body/div[@class="Section80000"]/table[.//th[contains(node(),"PREFERRED ANSWER LIST")]]'
    },
    {
        sectionName: 'SURVEY QUESTION',
        function: parseSurveyQuestionTable,
        xpath: 'html/body/div/table[.//th[contains(node(),"SURVEY")]]'
    },
    {
        sectionName: 'WEB CONTENT',
        function: parseWebContentTable,
        xpath: 'html/body/div/table[.//th[text()="WEB CONTENT"]]'
    },
    {
        sectionName: 'ARTICLE',
        function: parseArticleTable,
        xpath: 'html/body/div/table[.//th[text()="ARTICLE"]]'
    },
    {
        sectionName: 'COPYRIGHT TEXT',
        function: parseCopyrightText,
        xpath: '//p[@class="copyright"][1]'
    },
    {
        sectionName: 'VERSION',
        function: parseVersion,
        xpath: '//p[contains(text(),"Generated from LOINC version")]'
    }
];

export async function runOneLoinc(loincId) {
    let driver = await new Builder().forBrowser('chrome').build();
    let url = `http://r.details.loinc.org/LOINC/${loincId.trim()}.html?sections=Comprehensive`;
    await driver.get(url);
    let loinc = {URL: url, loincId: loincId};
    for (let task of tasks) {
        let sectionName = task.sectionName;
        let elements = await driver.findElements(By.xpath(task.xpath));
        if (elements && elements.length === 1) {
            if (task.function) {
                loinc[sectionName] = await task.function(driver, loincId, elements[0]);
            }
        }
    }
    driver.close();
    return loinc;
}
