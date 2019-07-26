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

import * as DiffJson from 'diff-json';
import { wipeUseless } from '../Shared/wipeUseless';

import { transferClassifications } from 'shared/system/classificationShared';
import { mergeBySource } from '../Shared/mergeBySource';
import { mergeBySourceName } from '../Shared/mergeBySourceName';
import { mergeDefinitions } from '../Shared/mergeDefinitions';
import { mergeDesignations } from '../Shared/mergeDesignations';
import { created, imported } from 'ingester/shared/utility';

const today = new Date().toJSON();

export async function createForm(loinc, orgInfo) {
    let designations = parseDesignations(loinc, {});
    let definitions = parseDefinitions(loinc);
    let ids = parseIds(loinc);
    let properties = parseProperties(loinc);
    let referenceDocuments = parseReferenceDocuments(loinc);
    let stewardOrg = parseStewardOrg(orgInfo);
    let sources = parseSources(loinc);
    let classification = await parseClassification(loinc, orgInfo);
    let formElements = await parseFormElements(loinc, orgInfo);

    let newForm = {
        tinyId: generateTinyId(),
        createdBy: {username: 'batchloader'},
        created,
        imported,
        registrationState: {registrationStatus: "Qualified"},
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

