import { isEqual, union } from 'lodash';
import { DataSet } from 'shared/de/dataElement.model';
import { CopyrightURL } from 'shared/form/form.model';
import {
    Attachment,
    CdeId,
    DataSource,
    Definition,
    DerivationRule,
    Designation,
    Property,
    ReferenceDocument,
} from 'shared/models.model';

export function attachmentComparator(a: Attachment, b: Attachment) {
    return isEqual(a.fileid, b.fileid);
}

export function dataSetComparator(a: DataSet, b: DataSet) {
    return (
        isEqual(a.id, b.id) &&
        isEqual(a.notes, b.notes) &&
        isEqual(a.source, b.source) &&
        isEqual(a.studyUri, b.studyUri)
    );
}

export function definitionComparator(a: Definition, b: Definition) {
    if (isEqual(a.definition, b.definition)) {
        b.tags = union(a.tags, b.tags);
        return true;
    } else {
        return false;
    }
}

export function derivationRuleComparator(a: DerivationRule, b: DerivationRule) {
    return (
        isEqual(a.ruleType, b.ruleType) &&
        isEqual(a.formula, b.formula) &&
        isEqual(a.name, b.name) &&
        isEqual(a.inputs, b.inputs) &&
        isEqual(a.outputs, b.outputs)
    );
}

export function designationComparator(a: Designation, b: Designation) {
    if (isEqual(a.designation, b.designation)) {
        b.tags = union(a.tags, b.tags);
        return true;
    } else {
        return false;
    }
}

export function idComparator(a: CdeId, b: CdeId) {
    return isEqual(a.id, b.id) && isEqual(a.source, b.source);
}

export function propertyComparator(a: Property, b: Property) {
    return isEqual(a.key, b.key) && isEqual(a.value, b.value) && isEqual(a.source, b.source);
}

export function referenceDocumentComparator(a: ReferenceDocument, b: ReferenceDocument) {
    return (
        isEqual(a.document, b.document) &&
        isEqual(a.title, b.title) &&
        isEqual(a.uri, b.uri) &&
        isEqual(a.providerOrg, b.providerOrg) &&
        isEqual(a.docType, b.docType)
    );
}

export function sourceComparator(a: DataSource, b: DataSource) {
    return isEqual(a.sourceName, b.sourceName);
}

export function urlComparator(a: CopyrightURL, b: CopyrightURL) {
    return isEqual(a.url, b.url);
}
