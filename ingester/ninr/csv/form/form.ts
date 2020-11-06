import { generateTinyId } from 'server/system/mongo-data';
import {
    BATCHLOADER, created, findOneForm, imported, lastMigrationScript, mergeDefinitions, mergeDesignations,
    mergeProperties,
    mergeReferenceDocuments, NINR_SOCIAL_DETERMINANTS_OF_HEALTH, updateForm
} from 'ingester/shared/utility';
import { parseNinrFormElements } from 'ingester/ninr/csv/form/ParseFormElements';
import { parseNinrClassification } from 'ingester/ninr/csv/form/ParseClassification';
import { addNinrSource, parseNinrSources } from 'ingester/ninr/csv/cde/ParseSources';
import { parseNinrDesignations } from 'ingester/ninr/csv/form/ParseDesignations';
import { parseNinrProperties } from 'ingester/ninr/csv/form/ParseProperties';
import { parseNinrDefinitions } from 'ingester/ninr/csv/form/ParseDefinitions';
import { parseNinrIds } from 'ingester/ninr/csv/form/ParseIds';
import { formModel, formSourceModel } from 'server/form/mongo-form';
import { addNinrClassification } from 'ingester/ninr/csv/cde/ParseClassification';
import { CdeForm } from 'shared/form/form.model';
import { mergeNinrIds } from 'ingester/ninr/csv/cde/ParseIds';
import { parseNinrReferenceDocuments } from 'ingester/ninr/csv/form/ParseReferenceDocuments';
import { parseNinrAttachments } from 'ingester/ninr/csv/form/ParseAttachments';

let updatedFormCount = 0;
let newFormCount = 0;


export async function createNinrForm(ninrFormName: string, ninrRows: any[], filePath: string) {
    const designations = parseNinrDesignations(ninrFormName);
    const definitions = parseNinrDefinitions();
    const sources = parseNinrSources();

    const referenceDocuments = await parseNinrReferenceDocuments(ninrRows);
    const properties = parseNinrProperties();
    const ids = parseNinrIds();
    const attachments = await parseNinrAttachments(ninrFormName, filePath);
    const classification = parseNinrClassification();

    const ninrForm: any = {
        tinyId: generateTinyId(),
        source: NINR_SOCIAL_DETERMINANTS_OF_HEALTH,
        sources,
        stewardOrg: {
            name: 'NINR'
        },
        registrationState: {
            registrationStatus: 'Qualified'
        },
        createdBy: BATCHLOADER,
        lastMigrationScript,
        changeNote: lastMigrationScript,
        created,
        imported,
        designations,
        definitions,
        formElements: [],
        referenceDocuments,
        properties,
        ids,
        attachments,
        classification,
        comments: []
    };
    await parseNinrFormElements(ninrForm, ninrRows);
    return ninrForm;
}


async function updateNinrRawArtifact(tinyId: string, formObj: CdeForm) {
    delete formObj.tinyId;
    delete formObj._id;
    formObj.classification = formObj.classification.filter(c => c.stewardOrg.name === 'NINR');
    const updateResult = await formSourceModel.updateOne({
        tinyId,
        source: NINR_SOCIAL_DETERMINANTS_OF_HEALTH
    }, formObj, {upsert: true});
    if (updateResult.nModified) {
        console.log(`${updateResult.nModified} form Raw Artifact modified: ${tinyId}`);
    }
    if (updateResult.upserted && updateResult.upserted.length) {
        console.log(`${updateResult.upserted.length} form Raw Artifact inserted: ${tinyId}`);
    }
}

export function mergeNinrForm(existingFormObj: CdeForm, newFormObj: CdeForm) {
    mergeDesignations(existingFormObj, newFormObj);
    mergeDefinitions(existingFormObj, newFormObj);

    mergeNinrIds(existingFormObj, newFormObj);
    mergeProperties(existingFormObj, newFormObj);
    mergeReferenceDocuments(existingFormObj, newFormObj);
    existingFormObj.formElements = newFormObj.formElements;
}

export async function runOneNinrForm(ninrFormName: string, ninrRows: any[], filePath: string) {
    const newFormObj = await createNinrForm(ninrFormName, ninrRows, filePath);
    const newForm = await new formModel(newFormObj);

    const cond = {
        archived: false,
        'registrationState.registrationStatus': {$ne: 'Retired'},
        tinyId: 'RJGIz6BY9'
    };

    const existingForms = await formModel.find(cond);
    const existingForm = findOneForm(existingForms);
    if (!existingForm) {
        const newFormSaved = await newForm.save().catch((err: any) => {
            console.log(`Not able to save new NINR form ${newForm.tinyId} ${err}`);
            process.exit(1);
        });
        newFormCount++;
        console.log(`newFormCount: ${newFormCount} newForm ${newForm.tinyId}`);
        await updateNinrRawArtifact(newForm.tinyId, newFormObj);
        return newFormSaved;
    } else {
        const existingFormObj = existingForm.toObject();
        mergeNinrForm(existingFormObj, newForm.toObject());
        addNinrClassification(existingFormObj, newForm.toObject());
        addNinrSource(existingFormObj, newForm.toObject());
        existingFormObj.lastMigrationScript = lastMigrationScript;
        existingFormObj.imported = imported;
        existingFormObj.changeNote = lastMigrationScript;
        const updatedFormSaved: any = await updateForm(existingFormObj, BATCHLOADER, {updateSource: true}).catch((err: any) => {
            console.log(`Not able to update existing NINR form ${existingForm.tinyId} ${err}`);
            process.exit(1);
        });
        updatedFormCount++;
        console.log(`updatedFormCount: ${updatedFormCount} updateFormSaved ${existingForm.tinyId}`);
        await updateNinrRawArtifact(existingFormObj.tinyId, newFormObj);
        return updatedFormSaved;
    }
}
