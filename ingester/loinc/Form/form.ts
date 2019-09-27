import { generateTinyId } from 'server/system/mongo-data';
import { parseClassification } from '../Shared/ParseClassification';
import { parseDefinitions } from '../Shared/ParseDefinitions';
import { parseDesignations } from '../Shared/ParseDesignations';
import { parseIds } from '../Shared/ParseIds';
import { parseProperties } from '../Shared/ParseProperties';
import { parseReferenceDocuments } from '../Shared/ParseReferenceDocuments';
import { parseStewardOrg } from '../Shared/ParseStewardOrg';
import { parseSources } from '../Shared/ParseSources';
import { parseFormElements } from './ParseFormElements';

import { BATCHLOADER, created, imported, version } from 'ingester/shared/utility';


export async function createLoincForm(loinc, classificationOrgName = 'LOINC', classificationArray = []) {
    const designations = parseDesignations(loinc);
    const definitions = parseDefinitions(loinc);
    const ids = parseIds(loinc);
    const properties = parseProperties(loinc);
    const referenceDocuments = parseReferenceDocuments(loinc);
    const stewardOrg = parseStewardOrg();
    const sources = parseSources(loinc);
    const formElements = await parseFormElements(loinc, classificationOrgName, classificationArray);

    const form = {
        tinyId: generateTinyId(),
        createdBy: BATCHLOADER,
        created,
        imported,
        source: 'LOINC',
        version,
        registrationState: {registrationStatus: 'Qualified'},
        sources,
        designations,
        definitions,
        ids,
        properties,
        referenceDocuments,
        stewardOrg,
        classification: [],
        formElements,
        attachments: []
    };
    await parseClassification(form, classificationOrgName, classificationArray);

    return form;
}
