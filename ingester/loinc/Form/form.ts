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
import { DEFAULT_LOINC_CONFIG } from 'ingester/loinc/Shared/utility';

export async function createLoincForm(loinc, config = DEFAULT_LOINC_CONFIG) {
    const designations = parseDesignations(loinc);
    const definitions = parseDefinitions(loinc);
    const ids = parseIds(loinc);
    const properties = parseProperties(loinc);
    const referenceDocuments = parseReferenceDocuments(loinc);
    const stewardOrg = parseStewardOrg(config);
    const sources = parseSources(loinc);
    const formElements = await parseFormElements(loinc, config);

    const form = {
        tinyId: generateTinyId(),
        createdBy: BATCHLOADER,
        created,
        imported,
        source: 'LOINC',
        version,
        registrationState: {registrationStatus:config.registrationStatus},
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
    await parseClassification(form, loinc, config);

    return form;
}
