import { SubmissionAttachment } from 'shared/boundaryInterfaces/db/submissionDb';
import { DataElement } from 'shared/de/dataElement.model';

type SubmissionAttachResponse = SubmissionAttachment;
type ValidationErrors = Record<'CDEs' | 'cover', string[]>;

interface LoadData {
    metadata: {
        name: string | null;
        version: string | null;
    };
    dataElements: Partial<DataElement | null>[]
}

interface VerifySubmissionFileProgress {
    row: number;
    rowTotal: number;
    cde: number;
    code: number;
    codeTotal: number;
    report?: VerifySubmissionFileReport;
}

interface VerifySubmissionFileReport {
    data: LoadData;
    validationErrors: ValidationErrors;
}
