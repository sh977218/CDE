import { parseDesignations } from './parseDesignations';
import { parseProperties } from './parseProperties';
import { parseValueDomain } from './parseValueDomain';
import { parseIds } from './parseIds';
import { generateTinyId } from '../../../server/system/mongo-data';
import { batchloader } from '../../shared/updatedByLoader';
import { classifyItem } from '../../../shared/system/classificationShared';

export async function createCde(row, formId, protocol) {
    let classificationArray = protocol['classification'];
    let designations = parseDesignations(row);
    let valueDomain = parseValueDomain(row);
    let ids = parseIds(formId, row);
    let properties = parseProperties(row);

    let newCde: any = {
        created: new Date(),
        createdBy: batchloader,
        tinyId: generateTinyId(),
        designations: designations,
        stewardOrg: {name: 'PhenX'},
        sources: [{sourceName: 'PhenX'}],
        classification: [],
        valueDomain,
        registrationState: {registrationStatus: 'Candidate'},
        ids,
        properties,
        attachments: []
    };

    let classificationToAdd = ['REDCap'].concat(classificationArray);
    classifyItem(newCde, "PhenX", classificationToAdd);

    return newCde;
}