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

import { created, imported } from 'ingester/shared/utility';


export async function createLoincForm(loinc, orgInfo) {
    const designations = parseDesignations(loinc, {});
    const definitions = parseDefinitions(loinc);
    const ids = parseIds(loinc);
    const properties = parseProperties(loinc);
    const referenceDocuments = parseReferenceDocuments(loinc);
    const stewardOrg = parseStewardOrg(orgInfo);
    const sources = parseSources(loinc);
    const classification = await parseClassification(loinc, orgInfo);
    const formElements = await parseFormElements(loinc, orgInfo);

    const newForm = {
        tinyId: generateTinyId(),
        createdBy: {username: 'batchloader'},
        created,
        imported,
        source: 'LOINC',
        registrationState: {registrationStatus: 'Qualified'},
        sources,
        designations,
        definitions,
        ids,
        properties,
        referenceDocuments,
        stewardOrg,
        classification,
        formElements,
        attachments: []
    };
    return newForm;
}

