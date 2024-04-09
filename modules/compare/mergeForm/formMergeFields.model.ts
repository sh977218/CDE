import { DeMergeFields } from 'compare/mergeDataElement/deMergeFields.model';

export interface FormMergeFields {
    copyright: boolean;
    designations: boolean;
    definitions: boolean;
    referenceDocuments: boolean;
    properties: boolean;
    ids: boolean;
    classifications: boolean;
    questions: boolean;
    cde: DeMergeFields;
}
