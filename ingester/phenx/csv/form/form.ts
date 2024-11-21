import {generateTinyId} from 'server/system/mongo-data';
import {BATCHLOADER, created, imported} from 'ingester/shared/utility';
import {parseDesignations} from 'ingester/phenx/csv/form/ParseDesignations';
import {parseDefinitions} from 'ingester/phenx/csv/form/ParseDefinitions';
import {parseSources} from 'ingester/phenx/csv/form/ParseSources';
import {parseReferenceDocuments} from 'ingester/phenx/csv/form/ParseReferenceDocuments';
import {parseProperties} from 'ingester/phenx/csv/form/ParseProperties';
import {parseIds} from 'ingester/phenx/csv/form/ParseIds';
import {parseAttachments} from 'ingester/phenx/csv/form/ParseAttachments';
import {parseClassification} from 'ingester/phenx/csv/form/ParseClassification';
import {parseFormElements} from 'ingester/phenx/csv/form/ParseFormElements';
import {DEFAULT_RADX_UP_CONFIG} from 'ingester/phenx/Shared/utility';
import {parseStewardOrg} from 'ingester/phenx/csv/form/ParseStewardOrg';
import {parseRegistrationState} from 'ingester/phenx/csv/form/ParseRegistrationState';

export async function createRedCapForm(formName: string, rows: any[], config = DEFAULT_RADX_UP_CONFIG) {
    const designations = parseDesignations(formName);
    const definitions = parseDefinitions();
    const stewardOrg = parseStewardOrg(config);
    const registrationState = parseRegistrationState(config);
    const sources = parseSources();
    const referenceDocuments = parseReferenceDocuments();
    const properties = parseProperties();
    const ids = parseIds();
    const attachments = parseAttachments();
    const redCapForm: any = {
        tinyId: generateTinyId(),
        stewardOrg,
        registrationState,
        createdBy: BATCHLOADER,
        created,
        imported,
        designations,
        definitions,
        sources,
        formElements: [],
        referenceDocuments,
        properties,
        ids,
        attachments,
        classification: [],
        comments: []
    };
    parseClassification(redCapForm, config);
    await parseFormElements(redCapForm, rows, config);
    return redCapForm;
}


export async function doOneRedCapForm(formName: string, rows: any[], config = DEFAULT_RADX_UP_CONFIG) {
    const redCapForm = await createRedCapForm(formName, rows, config);
    /*
        const newForm = new formModel(redCapForm);
        const newFormObj = newForm.toObject();
        const cond = {
            'registrationState.registrationStatus': {$ne: 'Retired'},
            archived: false,
            'designations.designation': formName
        };
        const existingForms: any[] = await formModel.find(cond);
        let existingForm: any = findOneForm(existingForms);
        if (!existingForm) {
            existingForm = await newForm.save().catch((err: any) => {
                console.log(`Not able to save Form when save new REDCap Form ${newForm.tinyId} ${err}`);
                process.exit(1);
            });
            console.log(`created Form tinyId: ${existingForm.tinyId}`);
        } else {
            const diff = compareElt(newForm.toObject(), existingForm.toObject(), 'REDCap');
            if (isEmpty(diff)) {
                existingForm.lastMigrationScript = lastMigrationScript;
                existingForm.imported = imported;
                existingForm = await existingForm.save().catch((err: any) => {
                    console.log(`Not able to save Form when save existing REDCap Form ${existingForm.tinyId} ${err}`);
                    process.exit(1);
                });
                console.log(`same Form tinyId: ${existingForm.tinyId}`);
            } else {
                const existingFormObj = existingForm.toObject();
                mergeElt(existingFormObj, newFormObj, 'REDCap');
                await updateForm(existingFormObj, BATCHLOADER, {updateSource: true}).catch((err: any) => {
                    console.log(`Not able to update Form when update existing REDCap Form ${existingForm.tinyId} ${err}`);
                    process.exit(1);
                });
                console.log(`updated Form tinyId: ${existingForm.tinyId}`);
            }
        }
        await updateRawArtifact(existingForm, newFormObj, config.source, config.classificationOrgName);

        const savedForm: any = await formModel.findOne(cond);
        return savedForm;
    */
}
