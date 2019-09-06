import * as cheerio from 'cheerio';
import { get } from 'request';
import { runOneLoinc } from 'ingester/loinc/Website/loincLoader';
import { getDomainCollection } from 'ingester/shared/utility';

const SECTIONS = [
    {
        tabName: 'Protocol',
        domId: '#tabprotocol',
        sections: [
            {description: 'Description:'},
            {specificInstructions: 'Specific Instructions:'},
            {protocol: 'Protocol:'},
            {protocolNameFromSource: 'Protocol Name from Source:'},
            {availability: 'Availability:'}
        ]
    },
    {
        tabName: 'Administration',
        domId: '#tabadministration',
        sections: [
            {personnelAndTrainingRequired: 'Personnel and Training Required'},
            {equipmentNeeds: 'Equipment Needs'},
            {requirements: 'Requirements', fn: findRequirementsTable},
            {modeOfAdministration: 'Mode of Administration'},
            {lifeStage: 'Life Stage:'},
            {participants: 'Participants:'}
        ]
    },
    {
        tabName: 'Details',
        domId: '#tabdetails',
        sections: [
            {selectionRationale: 'Selection Rationale'},
            {language: 'Language'},
            {standards: 'Standards', fn: findStandardsTable, async: true},
            {derivedVariables: 'Derived Variables'},
            {processAndReview: 'Process and Review'}
        ]
    },
    {
        tabName: 'Source',
        domId: '#tabsource',
        sections: [
            {source: 'Source'},
            {generalReferences: 'General References', fn: findGeneralReferences}
        ]
    },
    {
        tabName: 'Variables',
        domId: '#tabvariables',
        sections: [
            {protocolID: 'Protocol ID:'},
            {variables: 'Variables:', fn: findVariablesTable}
        ]
    },
    {
        tabName: 'Measure',
        domId: '#tabmeasure',
        sections: [
            {measureName: 'Measure Name:'},
            {releaseDate: 'Release Date:'},
            {definition: 'Definition'},
            {purpose: 'Purpose'},
            {keywords: 'Keywords'}
        ]
    }
];

function findNextText(node) {
    let text = '';
    let current = node.next();
    while (current[0] && current[0].name !== 'h5') {
        text += current.text().trim();
        current = current.next();
    }
    return text;
}

function findGeneralReferences(node) {
    let generalReferences = [];
    let current = node.next();
    while (current[0] && current[0].name !== 'h5') {
        generalReferences.push(current.text().trim());
        current = current.next();
    }
    return generalReferences;
}

async function findStandardsTable(node) {
    let standards = [];
    let trs = cheerio(node.next()).find('tr');
    for (let i = 1; i < trs.length; i++) {
        let tr = trs[i];
        let standard: any = {};
        let tds = cheerio(tr).find('td');
        standard['Standard'] = cheerio(tds[0]).text().trim();
        standard['Name'] = cheerio(tds[1]).text().trim();
        standard['ID'] = cheerio(tds[2]).text().trim();
        standard['Source'] = cheerio(tds[3]).text().trim();
        if (standard['Source'] === 'LOINC') {
            standard.loinc = await runOneLoinc(standard.ID).catch(e => {
                throw 'Error findStandardsTable ' + standard.ID;
            });

        }
        standards.push(standard);
    }
    return standards;
}

function findVariablesTable(node) {
    let variables = [];
    let trs = cheerio(node.next()).find('tr');
    for (let i = 1; i < trs.length; i++) {
        let tr = trs[i];
        let variable = {};
        let tds = cheerio(tr).find('td');
        variable['Variable Name'] = cheerio(tds[0]).text().trim();
        variable['Variable ID'] = cheerio(tds[1]).text().trim();
        variable['Variable Description'] = cheerio(tds[2]).text().trim();
        variable['Version'] = cheerio(tds[3]).text().trim();
        variable['Mapping'] = cheerio(tds[3]).text().trim();
        variables.push(variable);
    }
    return variables;
}

function findRequirementsTable(node) {
    let requirements = [];
    let trs = cheerio(node.next()).find('tr');
    for (let i = 1; i < trs.length; i++) {
        let tr = trs[i];
        let requirement = {};
        let tds = cheerio(tr).find('td');
        requirement['Requirement Category'] = cheerio(tds[0]).text().trim();
        requirement['Required'] = cheerio(tds[1]).text().trim();
        requirements.push(requirement);
    }
    return requirements;
}

function doOneProtocol(protocol) {
    return new Promise((resolve, reject) => {
        let protocolLink = protocol.protocolLink;
        get(protocolLink, async function (err, response, body) {
            if (err) reject(err);
            const $ = cheerio.load(body, {normalizeWhitespace: true});

            let protocolName = $('#main-content > div > div.row.mb-2 > div > h1').text().trim();
            protocol.protocolName = protocolName;

            let classification = $('#page-header > div > p').text().trim();
            protocol.classification = classification;

            for (let i = 0; i < SECTIONS.length; i++) {
                let SECTION = SECTIONS[i];
                let selector = SECTION.domId + ' h5';
                for (let j = 0; j < SECTION.sections.length; j++) {
                    let section: any = SECTION.sections[j];
                    for (let k in section) {
                        let value = section[k];
                        let node = $(selector).filter(function () {
                            return $(this).text().trim() === value;
                        });
                        if (!section.fn) {
                            protocol[k] = findNextText(node);
                        } else {
                            protocol[k] = await section.fn(node);
                        }
                    }
                }
            }
            resolve();
        })
    })
}

export async function runOnePhenX(protocolId) {
    let DomainCollectionMap = await getDomainCollection();
    let protocol = DomainCollectionMap[protocolId];
    await doOneProtocol(protocol);
    delete protocol.fn;
    delete protocol.async;
    return protocol;
}