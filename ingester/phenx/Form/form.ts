import { cloneDeep, isEmpty } from 'lodash';
import { diff as deepDiff } from 'deep-diff';
import { generateTinyId } from '../../../server/system/mongo-data';
import { batchloader } from '../../shared/updatedByLoader';
import { parseDesignations } from '../../phenx/Shared/ParseDesignations';
import { parseDefinitions } from '../../phenx/Shared/ParseDefinitions';
import { parseSources } from '../../phenx/Shared/ParseSources';
import { parseIds } from '../../phenx/Shared/ParseIds';
import { parseProperties } from '../../phenx/Shared/ParseProperties';
import { parseReferenceDocuments } from '../../phenx/Shared/ParseReferenceDocuments';
import { parseAttachments } from '../../phenx/Form/ParseAttachments';
import { parseClassification } from '../../phenx/Shared/ParseClassification';
import { parseFormElements } from '../../phenx/Form/ParseFormElements';

const today = new Date().toJSON();
const zipFolder = 's:/MLB/CDE/PhenX/www.phenxtoolkit.org/toolkit_content/redcap_zip/';

export async function createForm(protocol) {
    let designations = parseDesignations(protocol);
    let definitions = parseDefinitions(protocol);
    let sources = parseSources(protocol);
    let ids = parseIds(protocol);
    let properties = parseProperties(protocol);
    let referenceDocuments = parseReferenceDocuments(protocol);
    let attachments = parseAttachments(protocol).catch(e => {
        throw "Error await require('./ParseAttachments').parseAttachments(protocol): " + e;
    });
    let classification = parseClassification(protocol);

    let newForm = {
        tinyId: generateTinyId(),
        createdBy: batchloader,
        sources,
        created: today,
        imported: today,
        isCopyrighted: false,
        noRenderAllowed: false,
        stewardOrg: {name: 'PhenX'},
        registrationState: {registrationStatus: "Candidate"},
        designations,
        definitions,
        referenceDocuments,
        ids,
        attachments,
        classification,
        properties,
        formElements: [],
        comments: []
    };

    await parseFormElements(protocol, attachments, newForm);
    return newForm;
}

function getChildren(formElements, ids) {
    if (formElements) {
        formElements.forEach(formElement => {
            if (formElement.elementType === 'section' || formElement.elementType === 'form') {
                getChildren(formElement.formElements, ids);
            } else if (formElement.elementType === 'question') {
                ids.push({
                    id: formElement.question.cde.tinyId,
                    version: formElement.question.cde.version
                });
            }
        });
    }
}

export function compareForm(newForm, existingForm) {
    let newFormObj = cloneDeep(newForm);
    if (newFormObj.toObject) newFormObj = newFormObj.toObject();
    let existingFormObj = cloneDeep(existingForm);
    if (existingFormObj.toObject) existingFormObj = existingFormObj.toObject();

    [existingFormObj, newFormObj].forEach(obj => {
        obj.designations.sort((a, b) => a.designation >= b.designation);
        obj.definitions.sort((a, b) => a.definition >= b.definition);
        obj.ids.sort((a, b) => a.source >= b.source);
        obj.referenceDocuments.sort((a, b) => a.docType >= b.docType);
        obj.properties.sort((a, b) => a.key >= b.key);
        delete obj._id;
        delete obj.__v;
        delete obj.tinyId;
        delete obj.imported;
        delete obj.created;
        delete obj.createdBy;
        delete obj.updated;
        delete obj.updatedBy;
        delete obj.changeNote;
        delete obj.source;
        delete obj.archived;
        delete obj.views;

        delete obj.naming;
        delete obj.classification;
        delete obj.attachments;
        delete obj.mappingSpecifications;
        delete obj.derivationRules;
        delete obj.lastMigrationScript;
        delete obj.registrationState;
        delete obj.history;
        delete obj.comments;
        obj.cdeIds = [];
        getChildren(obj.formElements, obj.cdeIds);

        delete obj.formElements;

        obj.referenceDocuments.forEach(a => {
            for (let p in a) {
                if (isEmpty(a[p])) delete a[p];
            }
        });
        obj.ids.forEach(a => {
            if (a.source === 'NINDS') a.version = Number.parseFloat(a.version);
        });
    });
    return deepDiff(existingFormObj, newFormObj);
}


function mergeBySources(newSources, existingSources) {
    let otherSources = existingSources.filter(o => o.source !== 'PhenX');
    return newSources.concat(otherSources);
}

export function replaceClassificationByOrg(newClassification, existingClassification) {
    let otherClassifications = existingClassification.filter(c => c.stewardOrg.name !== 'PhenX')
    return newClassification.concat(otherClassifications);
}

export function mergeForm(existingForm, newForm) {

    existingForm.designations = newForm.designations;
    existingForm.definitions = newForm.definitions;
    existingForm.ids = mergeBySources(newForm.ids, existingForm.ids);
    existingForm.properties = mergeBySources(newForm.properties, existingForm.properties);
    existingForm.referenceDocuments = mergeBySources(newForm.referenceDocuments, existingForm.referenceDocuments);
    existingForm.attachments = newForm.attachments;
    existingForm.sources = mergeBySources(newForm.sources, existingForm.sources);
    existingForm.classification = replaceClassificationByOrg(newForm.classification, existingForm.classification);
    // Liz make those 50 forms qulified, We don't want to modify.
    if (existingForm.registrationState.registrationStatus !== 'Qualified') {
        existingForm.formElements = newForm.formElements;
    }
    //todo put comment about not updating form elements for qulifieid forms.
}