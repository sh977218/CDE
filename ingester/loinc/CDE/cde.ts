import {generateTinyId} from 'server/system/mongo-data';
import {parseClassification} from 'ingester/loinc/Shared/ParseClassification';
import {parseDefinitions} from 'ingester/loinc/Shared/ParseDefinitions';
import {parseDesignations} from 'ingester/loinc/Shared/ParseDesignations';
import {parseIds} from 'ingester/loinc/Shared/ParseIds';
import {parseProperties} from 'ingester/loinc/Shared/ParseProperties';
import {parseReferenceDocuments} from 'ingester/loinc/Shared/ParseReferenceDocuments';
import {parseStewardOrg} from 'ingester/loinc/Shared/ParseStewardOrg';
import {parseSources} from 'ingester/loinc/Shared/ParseSources';
import {parseConcepts} from 'ingester/loinc/CDE/ParseConcept';
import {parseValueDomain} from 'ingester/loinc/CDE/ParseValueDomain';

import {BATCHLOADER, created, imported, lastMigrationScript, version} from 'ingester/shared/utility';
import {DEFAULT_LOINC_CONFIG} from 'ingester/loinc/Shared/utility';

export async function createLoincCde(loinc, config = DEFAULT_LOINC_CONFIG) {
    const designations = parseDesignations(loinc);
    const definitions = parseDefinitions(loinc);
    const ids = parseIds(loinc);
    const properties = parseProperties(loinc);
    const referenceDocuments = parseReferenceDocuments(loinc);
    const valueDomain = parseValueDomain(loinc);
    const concepts = parseConcepts(loinc);
    const stewardOrg = parseStewardOrg(config);
    const sources = parseSources(loinc);

    const cde = {
        tinyId: generateTinyId(),
        createdBy: BATCHLOADER,
        created,
        imported,
        changeNote: lastMigrationScript,
        source: 'LOINC',
        version,
        registrationState: {registrationStatus: config.registrationStatus},
        sources,
        designations,
        definitions,
        ids,
        properties,
        referenceDocuments,
        objectClass: {concepts: concepts.objectClass},
        property: {concepts: concepts.property},
        dataElementConcept: {concepts: concepts.dataElementConcept},
        stewardOrg,
        valueDomain,
        classification: [],
        attachments: []
    };

    await parseClassification(cde, loinc, config);
    return cde;
}
