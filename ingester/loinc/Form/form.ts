import { generateTinyId } from '../../../server/system/mongo-data';
import { parseClassification } from '../Shared/ParseClassification';
import { parseDefinitions } from '../Shared/ParseDefinitions';
import { parseDesignations } from '../Shared/ParseDesignations';
import { parseIds } from '../Shared/ParseIds';
import { parseProperties } from '../Shared/ParseProperties';
import { parseReferenceDocuments } from '../Shared/ParseReferenceDocuments';
import { parseStewardOrg } from '../Shared/ParseStewardOrg';
import { parseSources } from '../Shared/ParseSources';
import { parseFormElements } from './ParseFormElements';

import { diff as deepDiff } from 'deep-diff';
import { wipeUseless } from '../Shared/wipeUseless';

import { transferClassifications } from '../../../shared/system/classificationShared';
import { mergeBySource } from '../Shared/mergeBySource';
import { mergeBySourceName } from '../Shared/mergeBySourceName';
import { mergeDefinitions } from '../Shared/mergeDefinitions';
import { mergeDesignations } from '../Shared/mergeDesignations';

const today = new Date().toJSON();

export function createForm(loinc, orgInfo) {
    return new Promise(async (resolve, reject) => {
        let designations = parseDesignations(loinc, {});
        let definitions = parseDefinitions(loinc);
        let ids = parseIds(loinc);
        let properties = parseProperties(loinc);
        let referenceDocuments = parseReferenceDocuments(loinc);
        let stewardOrg = parseStewardOrg(orgInfo);
        let sources = parseSources(loinc);
        let classification = await parseClassification(loinc, orgInfo).catch(e => {
            reject(e);
        });

        let formElements = await parseFormElements(loinc, orgInfo).catch(e => {
            reject(e);
        });
        let newForm = {
            tinyId: generateTinyId(),
            createdBy: {username: 'batchloader'},
            created: today,
            imported: today,
            registrationState: {registrationStatus: "Qualified"},
            sources,
            designations,
            definitions,
            ids,
            properties,
            referenceDocuments,
            stewardOrg,
            classification,
            formElements
        };
        resolve(newForm);
    });
}

export function compareForm(newForm, existingForm) {
    let newFormObj = newForm;
    if (newFormObj.toObject) newFormObj = newFormObj.toObject();
    let existingFormObj = existingForm;
    if (existingFormObj.toObject) existingFormObj = existingFormObj.toObject();

    [existingFormObj, newFormObj].forEach(obj => {
        obj.designations.sort((a, b) => a.designation >= b.designation);
        obj.definitions.sort((a, b) => a.definition >= b.definition);
        obj.ids.sort((a, b) => a.source >= b.source);
        obj.referenceDocuments.sort((a, b) => a.docType >= b.docType);
        obj.properties.sort((a, b) => a.key >= b.key);

        wipeUseless(obj);

        ['properties', 'referenceDocuments', 'ids'].forEach(p => {
            obj[p] = obj[p].filter(a => a.source === 'LOINC')
        })

    });

    return deepDiff(existingFormObj, newFormObj);
}


export async function mergeForm(newForm, existingForm) {
    existingForm.designations = mergeDesignations(existingForm.designations, newForm.designations);
    existingForm.definitios = mergeDefinitions(existingForm.definitions, newForm.definitions);
    existingForm.sources = mergeBySourceName(existingForm.sources, newForm.sources);

    existingForm.mappingSpecifications = newForm.mappingSpecifications;
    existingForm.referenceDocuments = mergeBySource(existingForm.referenceDocuments, newForm.referenceDocuments);
    existingForm.properties = mergeBySource(existingForm.properties, newForm.properties);
    existingForm.ids = mergeBySource(existingForm.ids, newForm.ids);
    existingForm.formElements = newForm.formElements;

    transferClassifications(newForm, existingForm);
}