import { isEmpty } from 'lodash';
import { generateTinyId } from 'server/system/mongo-data';
import { parseDesignations } from 'ingester/radx/form/ParseDesignations';
import { parseDefinitions } from 'ingester/radx/form/ParseDefinitions';
import { parseSources } from 'ingester/radx/form/ParseSources';
import { BATCHLOADER, created, imported } from 'ingester/shared/utility';
import { parseFormElements } from 'ingester/radx/form/ParseFormElements';
import { parseOrigin } from 'ingester/radx/form/ParseOrigin';
import { parseProperties } from 'ingester/radx/form/ParseProperties';


export async function createForm(row: any, formCdes: any[]) {
    const designations = parseDesignations(row);
    const definitions = parseDefinitions(row);
    const sources = parseSources(row);
    const origin = parseOrigin(row);
    const properties = parseProperties(row);

    const radxForm: any = {
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
        radxForm.formElements = await parseFormElements(radxForm, formCdes);
        for (const cde of formCdes) {
            // parseNhlbiCdeClassification(radxForm, cde);
        }
    }


    return radxForm;
}