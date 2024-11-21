import {imported, NINR_SOCIAL_DETERMINANTS_OF_HEALTH} from 'ingester/shared/utility';
import {CdeForm} from 'shared/form/form.model';

export function parseNinrSources() {
    return [{sourceName: NINR_SOCIAL_DETERMINANTS_OF_HEALTH, imported}];
}

export function addNinrSource(existingCde: CdeForm, newCdeObj: CdeForm) {
    const nonNinrSources = existingCde.sources.filter(s => s.sourceName !== NINR_SOCIAL_DETERMINANTS_OF_HEALTH);
    const ninrSources = newCdeObj.sources.filter(s => s.sourceName === NINR_SOCIAL_DETERMINANTS_OF_HEALTH);
    existingCde.sources = ninrSources.concat(nonNinrSources);
}
