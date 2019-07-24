import { By, webdriver } from 'selenium-webdriver';
import { parsePanelHierarchyTable } from 'ingester/loinc/Website/ParsePanelHierarchyTable';
import { parseLoincIdTable } from 'ingester/loinc/Website/ParseLoincIdTable';
import { parseLoincNameTable } from 'ingester/loinc/Website/ParseLoincNameTable';
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

const url_prefix = 'http://r.details.loinc.org/LOINC/';
const url_postfix = '.html';
const url_postfix_para = '?sections=Comprehensive';

function parse3rdPartyCopyrightTable() {

}

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

export function runOneLoinc(loincId) {
    return new Promise(async (resolve, reject) => {
        let driver = await new webdriver.Builder().forBrowser('firefox').build();
        let url = url_prefix + loincId.trim() + url_postfix + url_postfix_para;
        await driver.get(url);
        let loinc = {URL: url, loincId: loincId};
        for (let task of tasks) {
            let sectionName = task.sectionName;
            let elements = await driver.findElements(By.xpath(task.xpath));
            if (elements && elements.length === 1) {
                if (task.function) {
                    await task.function(driver, loincId, elements[0], result => {
                        loinc[sectionName] = result;
                    });
                }
            }
        }
        driver.close();
        resolve(loinc);
    });
}
