import { By } from 'selenium-webdriver';
import { isEmpty } from 'lodash';
import { loadLoincById } from 'ingester/loinc/website/newSite/loincLoader';

async function parseVersion(htmlElement) {
    const versionText = await htmlElement.getText();
    return versionText.replace('VERSION', '').trim();
}

async function parseLoincCode(htmlElement) {
    const loincCodeText = await htmlElement.getText();
    return loincCodeText.trim();
}

async function parseLongCommonName(htmlElement) {
    const longCommonNameText = await htmlElement.getText();
    return longCommonNameText.trim();
}

async function parseLoincStatus(htmlElement) {
    const loincStatusText = await htmlElement.getText();
    return loincStatusText.trim();
}

async function parseDl(dlElement) {
    const result = {};
    const childElements = await dlElement.findElements(By.xpath('./*'));
    const dtDdArray: any[] = [];
    let dtDd: any = {};
    for (const childElement of childElements) {
        const tagName = await childElement.getTagName();
        if (tagName === 'dt') {
            dtDd.dt = childElement;
        }
        if (tagName === 'dd') {
            dtDd.dd = childElement;
            dtDdArray.push(dtDd);
            dtDd = {};
        }
    }
    for (const {dt, dd} of dtDdArray) {
        const key = await dt.getText();
        const value = await dd.getText();
        result[key.trim()] = value.trim();
    }
    return result;
}

async function parseUl(ulElement) {
    const result: any[] = [];
    const liElements = await ulElement.findElements(By.xpath('./li'));
    for (const liElement of liElements) {
        const liText = await liElement.getText();
        const li = liText.trim();
        if (!isEmpty(li)) {
            result.push(li);
        }
    }
    return result;
}

async function parseTable(tableElement) {
    const thElements = await tableElement.findElements(By.xpath('./thead/tr/th'));
    const headers: any[] = [];
    for (const thElement of thElements) {
        const headerText = await thElement.getText();
        const header = headerText.trim();
        if (isEmpty(header)) {
            console.log(`${headers} has empty headers`);
            process.exit(1);
        }
        headers.push(header);
    }
    const currentLevels: any[] = [];
    let currentDepth = 0;

    const trElements = await tableElement.findElements(By.xpath('./tbody/tr'));
    for (const trElement of trElements) {
        const tdElements = await trElement.findElements(By.xpath('./td'));
        let i = 0;
        const row: any = {};
        let numberIndent = 0;
        for (const tdElement of tdElements) {
            const tdText = await tdElement.getText();
            const key = headers[i];
            const value = tdText.trim();
            row[key] = value.replace(/Indent/igm, '').trim();
            if (i === 0) {
                const matchIndent = value.match(/Indent/igm);
                if (matchIndent && matchIndent.length) {
                    numberIndent = matchIndent.length;
                }
            }
            i++;
        }
        if (numberIndent > 0) {
            row.loinc = await loadLoincById(row.loincId);
        }
        if (numberIndent === 0) {
            currentLevels[0] = row;
            currentDepth = 0;
        } else if (numberIndent > currentDepth) {
            currentLevels[currentDepth].elements.push(row);
            currentLevels[numberIndent] = row;
            currentDepth = numberIndent;
        } else if (numberIndent === currentDepth) {
            currentLevels[numberIndent - 1].elements.push(row);
            currentLevels[numberIndent] = row;
        } else if (numberIndent < currentDepth) {
            currentLevels[currentDepth] = null;
            currentLevels[numberIndent] = row;
            currentLevels[numberIndent - 1].elements.push(row);
            currentDepth = numberIndent;
        }
    }
    const panelHierarchy = currentLevels[0];
    return panelHierarchy;
}

async function getSelectionName(htmlElement) {
    const h2Element = await htmlElement.findElement(By.xpath('./h2'));
    const sectionNameText = await h2Element.getText();
    return sectionNameText.trim();
}

async function parseDlWithValidation(htmlElement) {
    const sectionName = await getSelectionName(htmlElement);
    const dlElements = await htmlElement.findElements(By.xpath('./dl'));
    if (dlElements.length !== 1) {
        console.log(`${sectionName} has wrong dl`);
        process.exit(1);
    } else {
        const result = await parseDl(dlElements[0]);
        return result;
    }
}

async function parseUlWithValidation(htmlElement) {
    const sectionName = await getSelectionName(htmlElement);
    const ulElements = await htmlElement.findElements(By.xpath('./ul'));
    if (ulElements.length !== 1) {
        console.log(`${sectionName} has wrong ul`);
        process.exit(1);
    } else {
        const result = await parseUl(ulElements[0]);
        return result;
    }
}

async function parsePWithValidation(htmlElement) {
    const sectionName = await getSelectionName(htmlElement);
    const pElements = await htmlElement.findElements(By.xpath('./p'));
    if (pElements.length !== 1) {
        console.log(`${sectionName} has wrong p`);
        process.exit(1);
    } else {
        const result = await pElements[0].getText();
        return result;
    }
}

async function parseTableWithValidation(htmlElement) {
    const sectionName = await getSelectionName(htmlElement);
    const tableElements = await htmlElement.findElements(By.xpath('./table'));
    if (tableElements.length !== 1) {
        console.log(`${sectionName} has wrong table`);
        process.exit(1);
    } else {
        const result = await parseTable(tableElements[0]);
        return result;
    }
}

async function parseFullySpecifiedName(htmlElement) {
    const fullySpecifiedName = await parseDl(htmlElement);
    return fullySpecifiedName;
}

async function f(htmlElement) {
    const result = await parseDlWithValidation(htmlElement);
    return result;
}

async function g(htmlElement) {
    const result = await parseUlWithValidation(htmlElement);
    return result;
}

async function parsePanelHierarchy(htmlElement) {
    return parseTableWithValidation(htmlElement);
}

export const tasks = [
    {
        sectionName: 'VERSION',
        function: parseVersion,
        xpath: "//*[@id='version']"
    },
    {
        sectionName: 'LOINC Code',
        function: parseLoincCode,
        xpath: "//*[@id='code1']"
    },
    {
        sectionName: 'Long Common Name',
        function: parseLongCommonName,
        xpath: "//*[@id='lcn']"
    },
    {
        sectionName: 'LOINC Status',
        function: parseLoincStatus,
        xpath: "//*[@class='status']"
    },
    {
        sectionName: 'Fully-Specified Name',
        function: parseFullySpecifiedName,
        xpath: "//*[@id='fsn']"
    },
    {
        sectionName: 'Status Information',
        function: f,
        xpath: "//*[@id='non-active']"
    },
    {
        sectionName: 'Additional Names',
        function: f,
        xpath: "//*[@id='names']"
    },
    {
        sectionName: 'Basic Attributes',
        function: f,
        xpath: "//*[@id='basic-attributes']"
    },
    {
        sectionName: 'Survey Question',
        function: f,
        xpath: "//*[@id='survey-question']"
    },
    {
        sectionName: 'Language Variants',
        function: f,
        xpath: "//*[@id='language-variants']"
    },
    {
        sectionName: 'Related Names',
        function: g,
        xpath: "//*[@id='related-names']"
    },
    {
        sectionName: 'LOINC Copyright',
        function: parsePWithValidation,
        xpath: "//*[@id='loinc-copyright']"
    },
    {
        sectionName: 'Term Description',
        function: parsePWithValidation,
        xpath: "//*[@id='term-description']"
    },
    {
        sectionName: 'Panel Hierarchy',
        function: parsePanelHierarchy,
        xpath: "//*[@id='panel-hierarchy']"
    },

];
