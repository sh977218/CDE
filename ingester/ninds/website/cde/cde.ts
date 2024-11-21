import {BATCHLOADER, created, imported, lastMigrationScript} from 'ingester/shared/utility';
import {parseDesignations} from 'ingester/ninds/website/cde/ParseDesignations';
import {parseDefinitions} from 'ingester/ninds/website/cde/ParseDefinitions';
import {parseIds} from 'ingester/ninds/website/cde/ParseIds';
import {parseProperties} from 'ingester/ninds/website/cde/ParseProperties';
import {parseReferenceDocuments} from 'ingester/ninds/website/cde/ParseReferenceDocuments';
import {generateTinyId} from 'server/system/mongo-data';
import {parseSources} from 'ingester/ninds/website/cde/ParseSources';
import {parseClassification} from 'ingester/ninds/website/shared/ParseClassification';
import {parseValueDomain} from 'ingester/ninds/website/cde/ParseValueDomain';

export function createNindsCde(nindsForms: any[]) {
    const designations = parseDesignations(nindsForms);
    const definitions = parseDefinitions(nindsForms);
    const sources = parseSources(nindsForms);
    const ids = parseIds(nindsForms);
    const properties = parseProperties(nindsForms);
    const referenceDocuments = parseReferenceDocuments(nindsForms);
    const valueDomain = parseValueDomain(nindsForms);

    const cde = {
        elementType: 'cde',
        source: 'NINDS',
        tinyId: generateTinyId(),
        createdBy: BATCHLOADER,
        created,
        imported,
        stewardOrg: {name: 'NINDS'},
        designations,
        definitions,
        sources,
        ids,
        properties,
        referenceDocuments,
        valueDomain,
        classification: [],
        registrationState: {registrationStatus: 'Qualified'},
        lastMigrationScript
    };

    parseClassification(nindsForms, cde);

    return cde;
}
