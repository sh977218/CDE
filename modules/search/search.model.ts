import { CurationStatus } from 'shared/models.model';
import { DataType } from 'shared/de/dataElement.model';

export class SearchSettings {
    classification: string[] = [];
    classificationAlt: string[] = [];
    datatypes: DataType[] = [];
    meshTree: string = '';
    page?: number = 1;
    q?: string;
    regStatuses: CurationStatus[] = [];
    resultPerPage?: number = 20;
    selectedOrg?: string;
    selectedOrgAlt?: string;
    excludeOrgs = [];
    excludeAllOrgs: boolean;
}
