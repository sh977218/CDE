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
        const keyText = await dt.getText();
        const key = keyText.replace(/\./igm, '-').trim();
        const value = await dd.getText();
        result[key] = value.trim();
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

async function parseP(pElement) {
    const result: any = {};
    const citeElements = await pElement.findElements(By.xpath('./cite'));
    if (citeElements.length > 0) {
        const citeText = await citeElements[0].getText();
        result.cite = citeText.trim();
    }
    const pText = await pElement.getText();
    if (result.cite) {
        return {
            text: pText.replace(result.cite, '').trim(),
            cite: result.cite
        };
    } else {
        return pText.trim();
    }
}

async function parseTable(tableElement) {
    const result: any[] = [];
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
    const trElements = await tableElement.findElements(By.xpath('./tbody/tr'));
    for (const trElement of trElements) {
        const tdElements = await trElement.findElements(By.xpath('./td'));
        let i = 0;
        const row: any = {};
        for (const tdElement of tdElements) {
            const citeElements = await tdElement.findElements(By.xpath('./cite'));
            if (citeElements.length > 0) {
                const citeText = await citeElements[0].getText();
                row.cite = citeText.trim();
            }
            const tdText = await tdElement.getText();
            const keyText = headers[i];
            const key = keyText.replace(/\./igm, '').trim();
            let value = tdText.trim();
            if (row.cite) {
                value = value.replace(row.cite, '').trim();
            }
            row[key] = value;
            i++;
        }
        result.push(row);
    }
    return result;
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
        const result = await parseP(pElements[0]);
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

async function selectionWithDl(htmlElement) {
    const result = await parseDlWithValidation(htmlElement);
    return result;
}

async function selectionWithUl(htmlElement) {
    const result = await parseUlWithValidation(htmlElement);
    return result;
}

async function parsePanelHierarchy(htmlElement) {
    const sectionName = await getSelectionName(htmlElement);
    const tableElements = await htmlElement.findElements(By.xpath('./table'));
    if (tableElements.length !== 1) {
        console.log(`${sectionName} has wrong table`);
        process.exit(1);
    } else {
        const tableElement = tableElements[0];
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
                row.elements = [];
                if (i === 0) {
                    const matchIndent = value.match(/Indent/igm);
                    if (matchIndent && matchIndent.length) {
                        numberIndent = matchIndent.length;
                    }
                }
                i++;
            }
            if (numberIndent > 0) {
                row.loinc = await loadLoincById(row.LOINC);
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
}


async function parseTermDescriptions(htmlElement) {
    const termDescriptions: any[] = [];
    const pElements = await htmlElement.findElements(By.xpath('./p'));
    for (const pElement of pElements) {
        const termDescription: any = {};
        const citeElement = await pElement.findElement(By.xpath('./cite'));
        const citeText = await citeElement.getText();
        const pText = await pElement.getText();
        termDescription.cite = citeText.trim();
        termDescription.text = pText.replace(citeText, '').trim();
        termDescriptions.push(termDescription);
    }
    return termDescriptions;
}

async function parsePartDescriptions(htmlElement) {
    const partDescriptions: any[] = [];
    const pElements = await htmlElement.findElements(By.xpath('./p'));
    for (const pElement of pElements) {
        const partDescription: any = {};
        const citeElement = await pElement.findElement(By.xpath('./cite'));
        const citeText = await citeElement.getText();
        const pText = await pElement.getText();
        partDescription.cite = citeText.trim();
        partDescription.text = pText.replace(citeText, '').trim();
        partDescriptions.push(partDescription);
    }
    return partDescriptions;
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
        function: selectionWithDl,
        xpath: "//*[@id='non-active']"
    },
    {
        sectionName: 'Additional Names',
        function: selectionWithDl,
        xpath: "//*[@id='names']"
    },
    {
        sectionName: 'Part Descriptions',
        function: parsePartDescriptions,
        xpath: "//*[@id='part-descriptions']"
    },
    {
        sectionName: 'Basic Attributes',
        function: selectionWithDl,
        xpath: "//*[@id='basic-attributes']"
    }, {
        sectionName: 'HL7 Attributes',
        function: selectionWithDl,
        xpath: "//*[@id='hl7-attributes']"
    },
    {
        sectionName: 'Survey Question',
        function: selectionWithDl,
        xpath: "//*[@id='survey-question']"
    },
    {
        sectionName: 'Language Variants',
        function: selectionWithDl,
        xpath: "//*[@id='language-variants']"
    },
    {
        sectionName: 'Related Names',
        function: selectionWithUl,
        xpath: "//*[@id='related-names']"
    },
    {
        sectionName: 'LOINC Copyright',
        function: parsePWithValidation,
        xpath: "//*[@id='loinc-copyright']"
    },
    {
        sectionName: 'Term Descriptions',
        function: parseTermDescriptions,
        xpath: "//*[@id='term-description']"
    },
    {
        sectionName: 'Related Codes',
        function: parseTableWithValidation,
        xpath: "//*[@id='related-codes']"
    },
    {
        sectionName: 'Normative Answer List',
        function: parseTableWithValidation,
        xpath: "//section[./h2[normalize-space(text()) ='Normative Answer List']]"
    },
    {
        sectionName: 'Example Answer List',
        function: parseTableWithValidation,
        xpath: "//section[./h2[normalize-space(text()) ='Example Answer List']]"
    },
    {
        sectionName: 'Panel Hierarchy',
        function: parsePanelHierarchy,
        xpath: "//*[@id='panel-hierarchy']"
    },
    {
        sectionName: 'Third Party Copyright',
        function: parsePWithValidation,
        xpath: "//*[@id='third-party-copyright']"
    },
    {
        sectionName: 'Reference Information',
        function: parseTableWithValidation,
        xpath: "//*[@id='reference-info']"
    }

];
