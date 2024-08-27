import { AdministrativeStatus, CurationStatus } from 'shared/models.model';
import { SearchSettingsElastic } from 'shared/search/search.model';

interface BatchModifyRequest {
    searchSettings: SearchSettingsElastic;
    count: number;
    editAdminStatus: {from: AdministrativeStatus, to: AdministrativeStatus};
    editRegStatus: {from: CurationStatus, to: CurationStatus};
}

interface BatchModifyResponse {

}
