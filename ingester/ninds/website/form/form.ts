import { BATCHLOADER, created, imported } from 'ingester/shared/utility';
import { generateTinyId } from 'server/system/mongo-data';

export async function createForm(nindsForms: any[]) {
    let designations = parseDesignations(nindsForms);
    let definitions = parseDefinitions(nindsForms);
    let sources = parseSources(nindsForms);
    let ids = parseIds(nindsForms);
    let properties = parseProperties(nindsForms);
    let referenceDocuments = parseReferenceDocuments(nindsForms);
    let formElements = await parseFormElements(nindsForms);

    let isCopyrighted = parseCopyright(nindsForms);

    let newForm = {
        elementType: 'form',
        source: 'NINDS',
        tinyId: generateTinyId(),
        sources,
        createdBy: BATCHLOADER,
        created,
        imported,
        isCopyrighted,
        noRenderAllowed: isCopyrighted,
        stewardOrg: {name: 'NINDS'},
        registrationState: {registrationStatus: "Qualified"},
        designations,
        definitions,
        referenceDocuments,
        ids,
        classification: [],
        properties,
        formElements,
        comments: []
    };

    parseClassification(nindsForms, newForm);

    return newForm;
};