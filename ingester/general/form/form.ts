import {isEmpty} from 'lodash';
import {generateTinyId} from 'server/system/mongo-data';
import {parseDesignations} from 'ingester/general/form/ParseDesignations';
import {parseDefinitions} from 'ingester/general/form/ParseDefinitions';
import {parseSources} from 'ingester/general/form/ParseSources';
import {BATCHLOADER, created, imported} from 'ingester/shared/utility';
import {parseFormElements} from 'ingester/general/form/ParseFormElements';
import {parseOrigin} from 'ingester/general/form/ParseOrigin';
import {parseProperties} from 'ingester/general/form/ParseProperties';


export async function createForm(row: any, formCdes: any[]) {
    const designations = parseDesignations(row);
    const definitions = parseDefinitions(row);
    const sources = parseSources(row);
    const origin = parseOrigin(row);
    const properties = parseProperties(row);

    const newForm: any = {
        tinyId: generateTinyId(),
        stewardOrg: {
            name: 'RADx Executive Committee'
        },
        registrationState: {
            registrationStatus: 'Qualified'
        },
        createdBy: BATCHLOADER,
        created,
        imported,
        designations,
        definitions,
        sources,
        origin,
        formElements: [],
        referenceDocuments: [],
        properties,
        ids: [],
        attachments: [],
        classification: [],
        comments: []
    };

    if (!isEmpty(formCdes)) {
        newForm.formElements = await parseFormElements(newForm, formCdes);
        for (const cde of formCdes) {
            // parseNhlbiCdeClassification(newForm, cde);
        }
    }


    return newForm;
}
