import _isEqual from 'lodash/isEqual';
import _union from 'lodash/union';
import { DataSet } from 'shared/de/dataElement.model';
import {
    Attachment,
    CdeId, DataSource,
    Definition,
    DerivationRule,
    Designation,
    Property,
    ReferenceDocument
} from 'shared/models.model';

export function attachmentComparator(a: Attachment, b: Attachment) {
    return _isEqual(a.fileid, b.fileid);
}

export function dataSetComparator(a: DataSet, b: DataSet) {
    return _isEqual(a.id, b.id)
        && _isEqual(a.notes, b.notes)
        && _isEqual(a.source, b.source)
        && _isEqual(a.studyUri, b.studyUri);
}

export function definitionComparator(a: Definition, b: Definition) {
    if (_isEqual(a.definition, b.definition)) {
        b.tags = _union(a.tags, b.tags);
        return true;
    } else {
        return false;
    }
}

export function derivationRuleComparator(a: DerivationRule, b: DerivationRule) {
    return _isEqual(a.ruleType, b.ruleType)
        && _isEqual(a.formula, b.formula)
        && _isEqual(a.name, b.name)
        && _isEqual(a.inputs, b.inputs)
        && _isEqual(a.outputs, b.outputs);
}

export function designationComparator(a: Designation, b: Designation) {
    if (_isEqual(a.designation, b.designation)) {
        b.tags = _union(a.tags, b.tags);
        return true;
    } else {
        return false;
    }
}

export function idComparator(a: CdeId, b: CdeId) {
    return _isEqual(a.id, b.id)
        && _isEqual(a.source, b.source);
}

export function propertyComparator(a: Property, b: Property) {
    return _isEqual(a.key, b.key)
        && _isEqual(a.value, b.value)
        && _isEqual(a.source, b.source);
}

export function referenceDocumentComparator(a: ReferenceDocument, b: ReferenceDocument) {
    return _isEqual(a.document, b.document)
        && _isEqual(a.title, b.title)
        && _isEqual(a.uri, b.uri)
        && _isEqual(a.providerOrg, b.providerOrg)
        && _isEqual(a.docType, b.docType);
}

export function sourceComparator(a: DataSource, b: DataSource) {
    return _isEqual(a.sourceName, b.sourceName);
}
