import { DataType } from 'shared/de/dataElement.model';
import { ArrayToType, CopyrightStatus, CurationStatus } from 'shared/models.model';

export class SearchSettings {
    classification: string[] = [];
    classificationAlt: string[] = [];
    datatypes: DataType[] = [];
    copyrightStatus: CopyrightStatus[] = [];
    excludeAllOrgs?: boolean;
    excludeOrgs: string[] = [];
    meshTree: string = '';
    nihEndorsed: boolean = false;
    page?: number = 1;
    q?: string = '';
    regStatuses: CurationStatus[] = [];
    resultPerPage: number = 20;
    searchTerm?: string;
    selectedOrg?: string = '';
    selectedOrgAlt?: string;

    constructor(q = '', resultsPerPage = 20) {
        this.q = q;
        this.resultPerPage = resultsPerPage;
    }
}

export class SearchSettingsElastic {
    excludeAllOrgs?: boolean;
    excludeOrgs: string[] = [];
    filterDatatype?: any; // server-side, ElasticCondition
    filterCopyrightStatus?: any; // server-side, ElasticCondition
    fullRecord?: boolean;
    includeAggregations?: boolean;
    includeRetired?: boolean;
    meshTree = '';
    nihEndorsed: boolean = false;
    page?: number = 1;
    q?: string;
    resultPerPage = 20;
    searchTerm?: string;
    searchToken?: string;
    selectedDatatypes: DataType[] = [];
    selectedCopyrightStatus: CopyrightStatus[] = [];
    selectedElements: string[] = [];
    selectedElementsAlt: string[] = [];
    selectedOrg?: string;
    selectedOrgAlt?: string;
    selectedStatuses: CurationStatus[] = [];

    constructor(resultPerPage = 20) {
        this.resultPerPage = resultPerPage;
    }
}

export const searchTypes = ['cde', 'endorsedCde', 'form'] as const;
export type SearchType = ArrayToType<typeof searchTypes>;
