import { parseDesignations } from 'ingester/phenx/redCap/parseDesignations';
import { parseProperties } from 'ingester/phenx/redCap/parseProperties';
import { parseValueDomain } from 'ingester/phenx/redCap/parseValueDomain';
import { parseIds } from 'ingester/phenx/redCap/parseIds';
import { generateTinyId } from 'server/system/mongo-data';
import { classifyItem } from 'shared/system/classificationShared';
import { batchloader, created } from 'ingester/shared/utility';

export async function createRedCde(row, protocol, newForm) {
    const classificationArray = protocol.classification;
    const designations = parseDesignations(row);
    const valueDomain = parseValueDomain(row);
    const ids = parseIds(row, newForm);
    const properties = parseProperties(row);

    const newCde: any = {
        tinyId: generateTinyId(),
        created,
        createdBy: batchloader,
        designations,
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

    const classificationToAdd = ['REDCap'].concat(classificationArray);
    classifyItem(newCde, 'PhenX', classificationToAdd);

    return newCde;
}
