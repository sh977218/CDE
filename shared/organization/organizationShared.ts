import { Organization } from 'shared/organization/organization';

export function validateOrganization(o: Organization) {
    if (!o.cdeStatusValidationRules) {
        o.cdeStatusValidationRules = [];
    }
    if (!o.classifications) {
        o.classifications = [];
    }
    if (!o.nameContexts) {
        o.nameContexts = [];
    }
    if (!o.nameTags) {
        o.nameTags = [];
    }
    if (!o.propertyKeys) {
        o.propertyKeys = [];
    }
}
