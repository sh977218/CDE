import {parseDesignations} from 'ingester/phenx/redCap/parseDesignations';
import {parseProperties} from 'ingester/phenx/redCap/parseProperties';
import {parseValueDomain} from 'ingester/phenx/redCap/parseValueDomain';
import {parseIds} from 'ingester/phenx/redCap/parseIds';
import {generateTinyId} from 'server/system/mongo-data';
import {BATCHLOADER, created, version} from 'ingester/shared/utility';
import {parseSources} from 'ingester/phenx/redCap/parseSources';
import {parseClassification} from 'ingester/phenx/Shared/ParseClassification';

export async function createRedCde(row, protocol, newForm) {
    const classification = parseClassification(protocol);
    const designations = parseDesignations(row);
    const valueDomain = parseValueDomain(row);
    const ids = parseIds(row, newForm);
    const properties = parseProperties(row);
    const sources = parseSources();

    const newCde: any = {
        tinyId: generateTinyId(),
        created,
        createdBy: BATCHLOADER,
        designations,
        stewardOrg: {name: 'PhenX'},
        sources,
        version,
        source: 'PhenX',
        classification,
        valueDomain,
        registrationState: {registrationStatus: 'Candidate'},
        ids,
        properties,
        attachments: [],
        comments: []
    };

    return newCde;
}
