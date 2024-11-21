import {Builder, By} from 'selenium-webdriver';

let driver = new Builder().forBrowser('firefox').build();

let tasks = [
    {
        sectionName: 'Protocol Release Date',
        function: parseTextContent,
        xpath: "//*[@id='element_RELEASE_DATE']"
    },
    {
        sectionName: 'Protocol Name From Source',
        function: parseTextContent,
        xpath: "//*[@id='element_PROTOCOL_NAME_FROM_SOURCE']"
    },
    {
        sectionName: 'Description of Protocol',
        function: parseTextContent,
        xpath: "//*[@id='element_DESCRIPTION']"
    },
    {
        sectionName: 'Specific Instructions',
        function: parseTextContent,
        xpath: "//*[@id='element_SPECIFIC_INSTRUCTIONS']"
    },
    {
        sectionName: 'Protocol',
        function: parseProtocolHtml,
        xpath: "//*[@id='element_PROTOCOL_TEXT']"
    },
    {
        sectionName: 'Variables',
        function: require('./ParseVariables').parseVariables,
        xpath: "//*[@id='element_VARIABLES']//table"
    },
    {
        sectionName: 'Selection Rationale',
        function: parseTextContent,
        xpath: "//*[@id='element_SELECTION_RATIONALE']"
    },
    {
        sectionName: 'Source',
        function: parseTextContent,
        xpath: "//*[@id='element_SOURCE']"
    },
    {
        sectionName: 'Life Stage',
        function: parseTextContent,
        xpath: "//*[@id='element_LIFESTAGE']"
    },
    {
        sectionName: 'Language',
        function: parseTextContent,
        xpath: "//*[@id='element_LANGUAGE']"
    },
    {
        sectionName: 'Participant',
        function: parseTextContent,
        xpath: "//*[@id='element_PARTICIPANT']"
    },
    {
        sectionName: 'Personnel and Training Required',
        function: parseTextContent,
        xpath: "//*[@id='element_PERSONNEL_AND_TRAINING_REQD']"
    },
    {
        sectionName: 'Equipment Needs',
        function: parseTextContent,
        xpath: "//*[@id='element_EQUIPMENT_NEEDS']"
    },
    {
        sectionName: 'Standards',
        function: require('./ParseStandards').parseStandards,
        xpath: "//*[@id='element_STANDARDS']//table"
    },
    {
        sectionName: 'General References',
        function: require('./ParseGeneralReferences').parseGeneralReferences,
        xpath: "//*[@id='element_REFERENCES']"
    },
    {
        sectionName: 'Mode of Administration',
        function: parseTextContent,
        xpath: "//*[@id='element_PROTOCOL_TYPE']"
    },
    {
        sectionName: 'Derived Variables',
        function: parseTextContent,
        xpath: "//*[@id='element_DERIVED_VARIABLES']"
    },
    {
        sectionName: 'Requirements',
        function: require('./ParseRequirements').parseRequirements,
        xpath: "//*[@id='element_REQUIREMENTS']//table"
    },
    {
        sectionName: 'Process and Review',
        function: parseTextContent,
        xpath: "//*[@id='element_PROCESS_REVIEW']"
    },
    {
        sectionName: 'Version',
        function: parseVersionContent,
        xpath: "//*[@id='element_PROCESS_REVIEW']/following-sibling::p[1]"
    }
];

async function parseVersionContent(element) {
    let text = await element.getText();
    let token = text.split(',');
    let version = token[token.length - 1];
    return version.replace('Ver', '').trim();

}

async function parseTextContent(element) {
    let text = await element.getText();
    return text.trim();
}

async function parseProtocolHtml(element) {
    let html = await element.getAttribute('innerHTML');
    return html;
}

export async function parseProtocol(link) {
    driver.get(link);
    let protocol = {classification: []};
    await driver.findElement(By.id('button_showfull')).click();
    let labelSections = await driver.findElements(By.id('label_VARIABLES'));
    if (labelSections.length > 0)
        await driver.findElement(By.id('label_VARIABLES')).click();
    for (let task of tasks) {
        let elements = await driver.findElements(By.xpath(task.xpath));
        if (elements && elements[0])
            protocol[task.sectionName] = await task.function(elements[0]);
    }
    let classificationArr = await driver.findElements(By.xpath("//p[@class='back'][1]/a"));
    for (let c of classificationArr) {
        let text = await c.getText();
        protocol.classification.push(text.trim());
    }
    return protocol;
}