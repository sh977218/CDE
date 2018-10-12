let webdriver = require('selenium-webdriver');
let By = webdriver.By;
let driver = new webdriver.Builder().forBrowser('chrome').build();

let LOINCLoader = require('../../loinc/Website/LOINCLoader');

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
        function: parseTextContent,
        xpath: "//*[@id='element_PROTOCOL_TEXT']"
    },
    {
        sectionName: 'Variables',
        function: parseTableContent,
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
        function: parseTableContent,
        xpath: "//*[@id='element_STANDARDS']//table"
    },
    {
        sectionName: 'General References',
        function: parseGeneralReferences,
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
        function: parseTableContent,
        xpath: "//*[@id='element_REQUIREMENTS']//table"
    },
    {
        sectionName: 'Process and Review',
        function: parseTextContent,
        xpath: "//*[@id='element_PROCESS_REVIEW']"
    }
];

function parseTextContent(element) {
    return new Promise(async (resolve, reject) => {
        let text = await element.getText();
        resolve(text.trim());
    })
}

function parseGeneralReferences(element) {
    let generalReferences = [];
    return new Promise(async (resolve, reject) => {
        let pElements = await element.findElements(By.xpath('p'));
        for (let pElement of pElements) {
            let text = await pElement.getText();
            generalReferences.push(text.trim());
        }
        resolve(generalReferences);
    })
}

function parseTableContent(element) {
    let records = [];
    return new Promise(async (resolve, reject) => {
        let trs = await element.findElements(By.xpath('tbody/tr'));
        let keys = [];

        let ths = await trs[0].findElements(By.xpath('th'));
        for (let th of ths) {
            let keyText = await th.getText();
            keys.push(keyText.trim());
        }
        trs.shift();

        for (let tr of trs) {
            let record = {};
            let tds = await tr.findElements(By.xpath('td'));
            let i = 0;
            for (let td of tds) {
                let tdText = await td.getText();
                record[keys[i]] = tdText.trim();
                i++;
            }
            i = 0;
            records.push(record);
            record = {};
        }
        resolve(records);
    })
}

exports.parseProtocol = function (link) {
    return new Promise(async (resolve, reject) => {
        driver.get(link);
        let protocol = {classification: []};
        await driver.findElement(By.id('button_showfull')).click();
        for (let task of tasks) {
            let elements = await driver.findElements(By.xpath(task.xpath));
            if (elements && elements[0])
                protocol[task.sectionName] = await task.function(elements[0]);
        }
        for (let standard of protocol['Standards']) {
            if (standard.Source === 'LOINC') {
                standard.loinc = await LOINCLoader.runOneLoinc(standard.ID);
            }
        }
        let classificationArr = await driver.findElements(By.xpath("//p[@class='back'][1]/a"));
        for (let c of classificationArr) {
            let text = await c.getText();
            protocol.classification.push(text.trim());
        }
        resolve(protocol);
    })
};