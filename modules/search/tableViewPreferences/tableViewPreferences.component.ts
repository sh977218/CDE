import { HttpClient } from '@angular/common/http';

import { AlertService } from '_app/alert/alert.service';
import { ElasticService } from '_app/elastic.service';
import { IdentifierSourcesResolve } from 'system/public/components/searchPreferences/identifier-source.resolve.service';

export class TableViewPreferencesComponent {
    identifierSources = [];
    searchSettings: any;

    constructor(private alert: AlertService,
                public esService: ElasticService,
                private http: HttpClient,
                private identifierSourceSvc: IdentifierSourcesResolve) {
        this.searchSettings = this.esService.searchSettings;
        this.identifierSources = this.identifierSourceSvc.identifierSources;
    }

    cancelSettings() {
        this.alert.addAlert('warning', 'Cancelled...');
    }

    changedIdentifier(searchSettings, data: { value: string[] }) {
        searchSettings.tableViewFields.identifiers = data.value;
    }

    loadDefault() {
        let defaultSettings = this.esService.getDefault();
        Object.keys(defaultSettings).forEach(key => {
            this.searchSettings[key] = defaultSettings[key];
        });
        this.alert.addAlert('info', 'Default settings loaded. Press Save to persist them.');
    }

    saveSettings() {
        this.esService.saveConfiguration(this.searchSettings);
        this.alert.addAlert('success', 'Settings saved!');
    }
}
