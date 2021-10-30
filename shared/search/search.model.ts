import { DataType } from 'shared/de/dataElement.model';
import { CurationStatus } from 'shared/models.model';

export class SearchSettings {
    classification: string[] = [];
    classificationAlt: string[] = [];
    datatypes: DataType[] = [];
    excludeAllOrgs?: boolean;
    excludeOrgs: string[] = [];
    page?: number = 1;
    q?: string = '';
    regStatuses: CurationStatus[] = [];
    resultPerPage: number = 20;
    searchTerm?: string;
    selectedOrg?: string = '';
    selectedOrgAlt?: string;
    nihEndorsed: boolean = false;

    constructor(q = '', resultsPerPage = 20) {
        this.q = q;
        this.resultPerPage = resultsPerPage;
    }
}

export class SearchSettingsElastic {
    [key: string]: any;
    excludeAllOrgs?: boolean;
    excludeOrgs: string[] = [];
    filterDatatype?: any; // server-side, ElasticCondition
    fullRecord?: boolean;
    includeAggregations?: boolean;
    includeRetired?: boolean;
    page?: number = 1;
    q?: string;
    resultPerPage = 20;
    searchTerm?: string;
    searchToken?: string;
    selectedDatatypes: DataType[] = [];
    selectedElements: string[] = [];
    selectedElementsAlt: string[] = [];
    selectedOrg?: string;
    selectedOrgAlt?: string;
    selectedStatuses: CurationStatus[] = [];
    nihEndorsed: boolean = false;

    constructor(resultPerPage = 20) {
        this.resultPerPage = resultPerPage;
    }
}

