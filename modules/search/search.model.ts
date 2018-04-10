export class SearchSettings {
    classification?: string[] = [];
    classificationAlt?: string[] = [];
    datatypes?: string[];
    meshTree?: string;
    page?: number = 1;
    q?: string;
    regStatuses?: string[];
    resultPerPage?: number = 20;
    selectedOrg?: string;
    selectedOrgAlt?: string;
}