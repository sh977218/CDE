const {Builder, By} = require('selenium-webdriver');
import {isEmpty, sortBy} from 'lodash';
import {parsePanelHierarchyTable} from 'ingester/loinc/website/oldSite/ParsePanelHierarchyTable';
import {parseLoincIdTable} from 'ingester/loinc/website/oldSite/ParseLoincIdTable';
import {parseLoincNameTable} from 'ingester/loinc/website/oldSite/ParseLoincNameTable';
import {parse3rdPartyCopyrightTable} from 'ingester/loinc/website/oldSite/Parse3rdPartyCopyrightTable';
import {parseNameTable} from 'ingester/loinc/website/oldSite/NameTable/ParseNameTable';
import {parseCopyrightNotice} from 'ingester/loinc/website/oldSite/ParseCopyrightNotice';
import {
    parsePartDefinitionDescriptionsTable
} from 'ingester/loinc/website/oldSite/ParsePartDefinitionDescriptionsTable';
import {
    parseTermDefinitionDescriptionsTable
} from 'ingester/loinc/website/oldSite/ParseTermDefinitionDescriptionsTable';
import {parsePartTable} from 'ingester/loinc/website/oldSite/ParsePartTable';
import {parseFormCodingInstructionsTable} from 'ingester/loinc/website/oldSite/ParseFormCodingInstructionsTable';
import {parseBasicAttributesTable} from 'ingester/loinc/website/oldSite/ParseBasicAttributesTable';
import {parseHL7AttributesTable} from 'ingester/loinc/website/oldSite/ParseHL7AttributesTable';
import {parseSubmittersInformationTable} from 'ingester/loinc/website/oldSite/ParseSubmittersInformationTable';
import {parseLanguageVariantsTable} from 'ingester/loinc/website/oldSite/ParseLanguageVariantsTable';
import {parseRelatedNamesTable} from 'ingester/loinc/website/oldSite/ParseRelatedNamesTable';
import {parseExampleUnitsTable} from 'ingester/loinc/website/oldSite/ParseExampleUnitsTable';
import {parseCopyrightTable} from 'ingester/loinc/website/oldSite/ParseCopyrightTable';
import {parseAnswerListTable} from 'ingester/loinc/website/oldSite/ParseAnswerListTable';
import {parseSurveyQuestionTable} from 'ingester/loinc/website/oldSite/ParseSurveyQuestionTable';
import {parseWebContentTable} from 'ingester/loinc/website/oldSite/ParseWebContentTable';
import {parseArticleTable} from 'ingester/loinc/website/oldSite/ParseArticleTable';
import {parseCopyrightText} from 'ingester/loinc/website/oldSite/ParseCopyrightText';
import {parseVersion} from 'ingester/loinc/website/oldSite/ParseVersion';

require('chromedriver');

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
    const driver = await new Builder().forBrowser('chrome').build();
    const url = `http://r.details.loinc.org/LOINC/${loincId.trim()}.html?sections=Comprehensive`;
    await driver.get(url);
    console.log(url);
    const loinc = {URL: url, loincId};
    const sortTask = sortBy(tasks, ['sectionName']);
    for (const task of sortTask) {
        const sectionName = task.sectionName;
        const elements = await driver.findElements(By.xpath(task.xpath));
        const elementsLength = elements.length;
        if (elementsLength === 0) {
            console.log(`${loincId} doesn't have Selection ${sectionName}.`);
        } else if (elementsLength > 1) {
            console.log(`${loincId} multiple Selection ${sectionName} found.`);
            process.exit(1);
        } else {
            loinc[sectionName] = await task.function(driver, loincId, elements[0]);
            if (isEmpty(loinc[sectionName])) {
                console.log(`${loincId} Selection ${sectionName} exists on page. but didn't get parsed.`);
                process.exit(1);
            }
        }
    }
    driver.close();
    return loinc;
}
