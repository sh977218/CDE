import { AdministrativeStatus, CurationStatus, ObjectId, UserRef } from 'shared/models.model';

interface Submission {
    _id: ObjectId;
    additionalInformation?: string;
    administrativeStatus: AdministrativeStatus;
    attachmentLicense?: SubmissionAttachment;
    attachmentSupporting?: SubmissionAttachment;
    attachmentWorkbook?: SubmissionAttachment;
    collectionUrl: string;
    collectionDescription: string;
    dateModified: string;
    dateSubmitted: string;
    endorsed: boolean;
    governanceReviewers: string[];
    history?: {
        date: string;
        user?: UserRef;
        action?: 'Endorse' | 'Governance Reject' | 'NLM Curator Approve' | 'NLM Curator Reject' | 'Submitter Submit';
    }[];
    licenseAttribution: boolean;
    licenseCost: boolean;
    licenseInformation: string;
    licenseOther: boolean;
    licensePermission: boolean;
    licensePublic: boolean;
    licenseTraining: boolean;
    name: string;
    nihInitiative: string;
    nihInitiativeBranch?: string;
    nlmCurators: string[];
    numberCdes: number;
    organizationCurators: string[];
    organizationEmail: string;
    organizationUrl: string;
    organizationPocTitle?: string;
    organizationPocFirst: string;
    organizationPocMi?: string;
    organizationPocLast: string;
    registrationStatus: CurationStatus;
    submitterEmail: string;
    submitterId: ObjectId;
    submitterOrganization: string;
    submitterNameTitle?: string;
    submitterNameFirst: string;
    submitterNameMi?: string;
    submitterNameLast: string;
    version: string;
}

interface SubmissionAttachment {
    fileId: string;
    filename: string;
    uploadedBy: string;
    uploadedDate: string;
}

export interface SubmissionDb {
    byId(id: string): Promise<Submission | null>;

    byNameAndVersion(name: string, version: string): Promise<Submission | null>;

    byKey(key: string): Promise<Submission | null>;

    count(query: any): Promise<number>;

    deleteOneById(_id: ObjectId): Promise<void>;

    query(query: any): Promise<Submission[]>;

    save(submission: Submission): Promise<Submission>;

    updatePropertiesById(_id: ObjectId, setExpression: Partial<Submission>): Promise<Submission | null>;
}
