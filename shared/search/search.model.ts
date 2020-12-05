import { DataType } from 'shared/de/dataElement.model';
import { CurationStatus } from 'shared/models.model';

export class SearchSettings {
    classification: string[] = [];
    classificationAlt: string[] = [];
    datatypes: DataType[] = [];
    excludeAllOrgs?: boolean;
    excludeOrgs: string[] = [];
    meshTree: string = '';
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
    [key: string]: any;
    excludeAllOrgs?: boolean;
    excludeOrgs: string[] = [];
    filter?: any; // server-side, ElasticCondition
    filterDatatype?: any; // server-side, ElasticCondition
    fullRecord?: boolean;
    includeAggregations?: boolean;
    meshTree = '';
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
    visibleStatuses?: CurationStatus[];

    constructor(selectedStatuses: CurationStatus[] = [], resultPerPage = 20) {
        this.resultPerPage = resultPerPage;
        this.selectedStatuses = selectedStatuses;
    }
}

