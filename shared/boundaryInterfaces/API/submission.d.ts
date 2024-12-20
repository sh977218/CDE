import { SubmissionAttachment } from 'shared/boundaryInterfaces/db/submissionDb';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';

type SubmissionAttachResponse = SubmissionAttachment;
type ValidationErrors = Record<'CDEs' | 'cover', string[]>;

interface LoadData {
    metadata: {
        name: string | null;
        version: string | null;
    };
    dataElements: (DataElement | null)[];
    forms: CdeForm[];
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
