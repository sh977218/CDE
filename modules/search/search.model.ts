export class SearchSettings {
    classification?: string[] = [];
    classificationAlt?: string[] = [];
    datatypes?: string[];
    meshTree?: string;
    page?: Number = 1;
    q?: string;
    regStatuses?: string[];
    resultPerPage?: Number = 20;
    selectedOrg?: string;
    selectedOrgAlt?: string;
}