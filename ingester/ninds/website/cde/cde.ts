import { BATCHLOADER } from 'ingester/shared/utility';
import { parseDesignations } from 'ingester/ninds/website/cde/ParseDesignations';
import { parseDefinitions } from 'ingester/ninds/website/cde/ParseDefinitions';
import { parseIds } from 'ingester/ninds/website/cde/ParseIds';

export async function createNindsCde(nindsForms: any[]) {
    const designations = parseDesignations(nindsForms);
    const definitions = parseDefinitions(nindsForms);
    const sources = parseSources(nindsForms);
    const ids = parseIds(nindsForms);
    const properties = parseProperties(nindsForms);
    const referenceDocuments = parseReferenceDocuments(nindsForms);
    const classification = [];
    const valueDomain = parseValueDomain(nindsForms);

    const cde = {
        elementType: 'cde',
        source: 'NINDS',
        tinyId: generateTinyId(),
        createdBy: BATCHLOADER,
        created: today,
        imported: today,
        stewardOrg: {name: 'NINDS'},
        designations,
        definitions,
        sources,
        ids,
        properties,
        referenceDocuments,
        valueDomain,
        classification,
        registrationState: {registrationStatus: 'Qualified'},
        comments: []
    };

    parseClassification(nindsForms, cde);

    return cde;
}
