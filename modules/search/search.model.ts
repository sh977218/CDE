import { CurationStatus } from 'shared/models.model';
import { DataType } from 'shared/de/dataElement.model';

export class SearchSettings {
    classification: string[] = [];
    classificationAlt: string[] = [];
    datatypes?: DataType[] = [];
    excludeAllOrgs?: boolean;
    excludeOrgs?: string[] = [];
    meshTree?: string = '';
    page?: number = 1;
    q?: string;
    regStatuses: CurationStatus[] = [];
    resultPerPage?: number = 20;
    searchTerm?: string;
    selectedOrg?: string;
    selectedOrgAlt?: string;
}

export class SearchSettingsElastic {
    excludeAllOrgs?: boolean;
    excludeOrgs: string[] = [];
    fullRecord?: boolean;
    includeAggregations?: boolean;
    meshTree: string = '';
    page?: number = 1;
    q?: string;
    resultPerPage?: number = 20;
    searchTerm?: string;
    searchToken?: string;
    selectedDatatypes: DataType[] = [];
    selectedElements: string[] = [];
    selectedElementsAlt: string[] = [];
    selectedOrg?: string;
    selectedOrgAlt?: string;
    selectedStatuses: CurationStatus[] = [];
    visibleStatuses?: CurationStatus[];
}

