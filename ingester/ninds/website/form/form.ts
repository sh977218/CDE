import {BATCHLOADER, created, imported, lastMigrationScript} from 'ingester/shared/utility';
import {generateTinyId} from 'server/system/mongo-data';
import {parseDefinitions} from 'ingester/ninds/website/form/ParseDefinitions';
import {parseDesignations} from 'ingester/ninds/website/form/ParseDesignations';
import {parseSources} from 'ingester/ninds/website/form/ParseSources';
import {parseIds} from 'ingester/ninds/website/form/ParseIds';
import {parseProperties} from 'ingester/ninds/website/form/ParseProperties';
import {parseReferenceDocuments} from 'ingester/ninds/website/form/ParseReferenceDocuments';
import {parseCopyright} from 'ingester/ninds/website/form/ParseCopyright';
import {parseFormElements} from 'ingester/ninds/website/form/ParseFormElements';
import {parseClassification} from 'ingester/ninds/website/shared/ParseClassification';

export async function createNindsForm(nindsForms: any[]) {
    const designations = parseDesignations(nindsForms);
    const definitions = parseDefinitions();
    const sources = parseSources();
    const ids = parseIds(nindsForms);
    const properties = parseProperties();
    const referenceDocuments = parseReferenceDocuments(nindsForms);
    const formElements = await parseFormElements(nindsForms);

    const isCopyrighted = parseCopyright(nindsForms);

    const newForm = {
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
        registrationState: {registrationStatus: 'Qualified'},
        designations,
        definitions,
        referenceDocuments,
        ids,
        classification: [],
        properties,
        formElements,
        comments: [],
        lastMigrationScript
    };

    parseClassification(nindsForms, newForm);

    return newForm;
}
