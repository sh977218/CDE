import { DeMergeFields } from '../mergeDataElement/deMergeFields.model';

export interface FormMergeFields {
    designations: boolean;
    definitions: boolean;
    referenceDocuments: boolean;
    properties: boolean;
    ids: boolean;
    classifications: boolean;
    questions: boolean;
    cde: DeMergeFields;
}