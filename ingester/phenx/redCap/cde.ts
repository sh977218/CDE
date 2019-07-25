import { parseDesignations } from 'ingester/phenx/redCap/parseDesignations';
import { parseProperties } from 'ingester/phenx/redCap/parseProperties';
import { parseValueDomain } from 'ingester/phenx/redCap/parseValueDomain';
import { parseIds } from 'ingester/phenx/redCap/parseIds';
import { generateTinyId } from 'server/system/mongo-data';
import { classifyItem } from 'shared/system/classificationShared';
import { batchloader, created } from 'ingester/shared/utility';

export async function createCde(row, formId, protocol) {
    let classificationArray = protocol['classification'];
    let designations = parseDesignations(row);
    let valueDomain = parseValueDomain(row);
    let ids = parseIds(formId, row);
    let properties = parseProperties(row);

    let newCde: any = {
        tinyId: generateTinyId(),
        created,
        createdBy: batchloader,
        designations: designations,
        stewardOrg: {name: 'PhenX'},
        sources: [],
        classification: [],
        valueDomain,
        registrationState: {registrationStatus: 'Candidate'},
        ids,
        properties,
        attachments: [],
        comments: []
    };

    let classificationToAdd = ['REDCap'].concat(classificationArray);
    classifyItem(newCde, "PhenX", classificationToAdd);

    return newCde;
}