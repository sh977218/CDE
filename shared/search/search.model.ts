import { DataType } from 'shared/de/dataElement.model';
import { AdministrativeStatus, ArrayToType, CopyrightStatus, CurationStatus } from 'shared/models.model';

export class SearchSettings {
    adminStatuses: AdministrativeStatus[] = [];
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
    selectedAdminStatuses: AdministrativeStatus[] = [];
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

// order, names, and values match generateSearchForTerm() for SearchSettings in client using buildElasticQuerySettings() as mapper
export function searchSettingsElasticToQueryString(settings: SearchSettingsElastic): string {
    let queries: string[] = [];
    function addQuery(name: keyof Omit<SearchSettings, 'meshTree'> | 'topic', value: string) {
        queries.push(name + '=' + encodeURIComponent(value));
    }
    if (settings.q) {
        addQuery('q', settings.q);
    }
    if (settings.selectedCopyrightStatus.length > 0) {
        addQuery('copyrightStatus', settings.selectedCopyrightStatus.join(';'));
    }
    if (settings.selectedStatuses.length > 0) {
        addQuery('regStatuses', settings.selectedStatuses.join(';'));
    }
    if (settings.selectedAdminStatuses.length > 0) {
        addQuery('adminStatuses', settings.selectedAdminStatuses.join(';'));
    }
    if (settings.selectedDatatypes.length > 0) {
        addQuery('datatypes', settings.selectedDatatypes.join(';'));
    }
    if (settings.selectedOrg) {
        addQuery('selectedOrg', settings.selectedOrg);
    }
    if (settings.selectedElements.length > 0) {
        addQuery('classification', settings.selectedElements.join(';'));
    }
    if (settings.selectedOrgAlt) {
        addQuery('selectedOrgAlt', settings.selectedOrgAlt);
    }
    if (settings.selectedElementsAlt.length > 0) {
        addQuery('classificationAlt', settings.selectedElementsAlt.join(';'));
    }
    if (settings.excludeAllOrgs) {
        addQuery('excludeAllOrgs', true + '');
    }
    if (settings.excludeOrgs?.length > 0) {
        addQuery('excludeOrgs', settings.excludeOrgs.join(';'));
    }
    if (settings.page && settings.page > 1) {
        addQuery('page', settings.page + '');
    }
    if (settings.nihEndorsed) {
        addQuery('nihEndorsed', settings.nihEndorsed ? 'true' : 'false');
    }
    if (settings.meshTree) {
        addQuery('topic', settings.meshTree);
    }
    return queries.join('&');
}

export const searchTypes = ['cde', 'endorsedCde', 'form'] as const;
export type SearchType = ArrayToType<typeof searchTypes>;
