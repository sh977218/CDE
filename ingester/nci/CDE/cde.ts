import { parseDesignations } from 'ingester/nci/Shared/ParseDesignations';
import { parseDefinitions } from 'ingester/nci/Shared/ParseDefinitions';
import { parseRegistrationState } from 'ingester/nci/Shared/ParseRegistrationState';
import { parseSources } from 'ingester/nci/Shared/ParseSources';
import { parseOrigin } from 'ingester/nci/Shared/ParseOrigin';
import { parseIds } from 'ingester/nci/Shared/ParseIds';
import { parseProperties } from 'ingester/nci/Shared/ParseProperties';
import { parseAttachments } from 'ingester/nci/Shared/ParseAttachments';
import { parseReferenceDocuments } from 'ingester/nci/Shared/ParseReferenceDocuments';
import { parseValueDomain } from 'ingester/nci/CDE/ParseValueDomain';
import { parseObjectClass } from 'ingester/nci/CDE/ParseObjectClass';
import { parseProperty } from 'ingester/nci/CDE/ParseProperty';
import { parseDataElementConcept } from 'ingester/nci/CDE/ParseDataElementConcept';
import { BATCHLOADER, created, imported } from 'ingester/shared/utility';
import { parseClassification } from 'ingester/nci/Shared/ParseClassification';
import { generateTinyId } from 'server/system/mongo-data';
import { parseStewardOrg } from 'ingester/nci/Shared/ParseStewardOrg';

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
