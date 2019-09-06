import { findIndex, isEmpty, isEqual } from 'lodash';
import { generateTinyId } from 'server/system/mongo-data';
import {
    BATCHLOADER, compareElt, created, imported, lastMigrationScript, mergeElt, sortProperties, sortReferenceDocuments,
    updateCde
} from 'ingester/shared/utility';
import { createNindsCde, getCell, } from 'ingester/ninds/csv/cde';
import { DataElement } from 'server/cde/mongo-cde';
import { parseDesignations } from 'ingester/ninds/csv/form/ParseDesignations';
import { parseDefinitions } from 'ingester/ninds/csv/form/ParseDefinitions';
import { parseSources } from 'ingester/ninds/csv/shared/ParseSources';
import { parseReferenceDocuments } from 'ingester/ninds/csv/form/ParseReferenceDocuments';
import { parseProperties } from 'ingester/ninds/csv/form/ParseProperties';
import { parseIds } from 'ingester/ninds/csv/form/ParseIds';
import { parseClassification } from 'ingester/ninds/csv/form/ParseClassification';
import { parseFormElements } from 'ingester/ninds/csv/form/ParseFormElements';

export async function createNindsForm(formName, rows) {
    const designations = parseDesignations(formName);
    const definitions = parseDefinitions();
    const sources = parseSources();
    const referenceDocuments = await parseReferenceDocuments(rows);
    const formElements = await parseFormElements(rows);
    const properties = parseProperties();
    const ids = parseIds();
    const classification = parseClassification(rows);
    const nindsForm = {
        tinyId: generateTinyId(),
        stewardOrg: {
            name: 'NINDS'
        },
        registrationState: {
            registrationStatus: 'Qualified'
        },
        createdBy: BATCHLOADER,
        created,
        imported,
        designations,
        definitions,
        sources,
        formElements,
        referenceDocuments,
        properties,
        ids,
        classification
    };
    return nindsForm;
}
