import {parseDesignations} from '../Shared/ParseDesignations';
import {parseDefinitions} from '../Shared/ParseDefinitions';
import {parseRegistrationState} from '../Shared/ParseRegistrationState';
import {parseSources} from '../Shared/ParseSources';
import {parseOrigin} from '../Shared/ParseOrigin';
import {parseIds} from '../Shared/ParseIds';
import {parseProperties} from '../Shared/ParseProperties';
import {parseAttachments} from '../Shared/ParseAttachments';
import {parseReferenceDocuments} from '../Shared/ParseReferenceDocuments';
import {parseValueDomain} from '../CDE/ParseValueDomain';
import {parseObjectClass} from '../CDE/ParseObjectClass';
import {parseProperty} from '../CDE/ParseProperty';
import {parseDataElementConcept} from '../CDE/ParseDataElementConcept';
import {BATCHLOADER, created, imported} from 'ingester/shared/utility';
import {parseClassification} from '../Shared/ParseClassification';
import {generateTinyId} from 'server/system/mongo-data';
import {parseStewardOrg} from '../Shared/ParseStewardOrg';

export async function createNciCde(nciXmlCde: any, orgInfo: any) {
    const designations = parseDesignations(nciXmlCde);
    const definitions = parseDefinitions(nciXmlCde);
    const registrationState = parseRegistrationState(nciXmlCde, orgInfo);
    const sources = await parseSources(nciXmlCde);
    const stewardOrg = parseStewardOrg(orgInfo);
    const origin = parseOrigin(nciXmlCde);
    const ids = parseIds(nciXmlCde);
    const properties = parseProperties(nciXmlCde);
    const attachments = await parseAttachments(nciXmlCde);
    const referenceDocuments = parseReferenceDocuments(nciXmlCde);

    const valueDomain = parseValueDomain(nciXmlCde);
    const objectClass = parseObjectClass(nciXmlCde);
    const property = parseProperty(nciXmlCde);
    const dataElementConcept = parseDataElementConcept(nciXmlCde);

    const cde = {
        tinyId: generateTinyId(),
        imported,
        created,
        createdBy: BATCHLOADER,
        registrationState,
        sources,
        source: 'caDSR',
        origin,
        version: nciXmlCde.VERSION[0],
        designations,
        definitions,
        valueDomain,
        stewardOrg,
        ids,
        attachments,
        properties,
        referenceDocuments,
        objectClass,
        property,
        dataElementConcept,
        classification: [],
        comments: []
    };

    parseClassification(nciXmlCde, cde, orgInfo);
    return cde;
}
