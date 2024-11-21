import * as cheerio from 'cheerio';
import {getDomainCollectionSite} from 'ingester/shared/utility';
import {loadLoincById} from 'ingester/loinc/website/newSite/loincLoader';
import fetch from 'node-fetch';
import {handleErrors, text} from 'shared/fetch';

const SECTIONS: any[] = [
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
    const generalReferences: any[] = [];
    let current = node.next();
    while (current[0] && current[0].name !== 'h5') {
        generalReferences.push(current.text().trim());
        current = current.next();
    }
    return generalReferences;
}

async function findStandardsTable(node) {
    const standards: any[] = [];
    const trs = cheerio(node.next()).find('tr');
    for (let i = 1; i < trs.length; i++) {
        const tr = trs[i];
        const standard: any = {};
        const tds = cheerio(tr).find('td');
        standard.Standard = cheerio(tds[0]).text().trim();
        standard.Name = cheerio(tds[1]).text().trim();
        standard.ID = cheerio(tds[2]).text().trim();
        standard.Source = cheerio(tds[3]).text().trim();
        if (standard.Source === 'LOINC') {
            standard.loinc = await loadLoincById(standard.ID).catch(e => {
                throw new Error('Error findStandardsTable ' + standard.ID + ' error: ' + e);
            });

        }
        standards.push(standard);
    }
    return standards;
}

function findVariablesTable(node) {
    const variables: any[] = [];
    const trs = cheerio(node.next()).find('tr');
    for (let i = 1; i < trs.length; i++) {
        const tr = trs[i];
        const variable: any = {};
        const tds = cheerio(tr).find('td');
        variable['Variable Name'] = cheerio(tds[0]).text().trim();
        variable['Variable ID'] = cheerio(tds[1]).text().trim();
        variable['Variable Description'] = cheerio(tds[2]).text().trim();
        variable.Version = cheerio(tds[3]).text().trim();
        variable.Mapping = cheerio(tds[3]).text().trim();
        variables.push(variable);
    }
    return variables;
}

function findRequirementsTable(node) {
    const requirements: any[] = [];
    const trs = cheerio(node.next()).find('tr');
    for (let i = 1; i < trs.length; i++) {
        const tr = trs[i];
        const requirement: any = {};
        const tds = cheerio(tr).find('td');
        requirement['Requirement Category'] = cheerio(tds[0]).text().trim();
        requirement.Required = cheerio(tds[1]).text().trim();
        requirements.push(requirement);
    }
    return requirements;
}

function doOneProtocol(protocol) {
    return new Promise((resolve, reject) => {
        const protocolLink = protocol.protocolLink;
        console.log('protocolLink: ' + protocolLink);
        fetch(protocolLink)
            .then(handleErrors)
            .then(text)
            .then(async body => {
                const $ = cheerio.load(body, {normalizeWhitespace: true});

                protocol.protocolName = $('#main-content > div > div.row.mb-2 > div > h1').text().trim();

                protocol.classification = $('#page-header > div > p').text().trim();

                for (const SECTION of SECTIONS) {
                    const selector = SECTION.domId + ' h5';
                    for (const section of SECTION.sections) {
                        for (const k in section) {
                            if (section.hasOwnProperty(k)) {
                                const value = section[k];
                                const node = $(selector).filter(function () {
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
                }
                resolve();
            }, reject);
    });
}

export async function runOnePhenX(protocolId) {
    const domainCollectionMap = await getDomainCollectionSite();
    const protocol = domainCollectionMap[protocolId];
    await doOneProtocol(protocol);
    delete protocol.fn;
    delete protocol.async;
    return protocol;
}
