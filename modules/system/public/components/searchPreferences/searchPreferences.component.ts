import { Component } from '@angular/core';

import { AlertService } from '_app/alert.service';
import { ElasticService } from '_app/elastic.service';

@Component({
    selector: 'cde-search-preferences',
    templateUrl: 'searchPreferences.component.html'
})
export class SearchPreferencesComponent {
    searchSettings: any;

    constructor(private alert: AlertService,
                public esService: ElasticService) {
        this.searchSettings = this.esService.searchSettings;
    }

    cancelSettings() {
        this.alert.addAlert('warning', 'Cancelled...');
        window.history.back();
    }

    loadDefault() {
        let defaultSettings: any = this.esService.getDefault();
        Object.keys(defaultSettings).forEach(key => {
            this.searchSettings[key] = defaultSettings[key];
        });
        this.alert.addAlert('info', 'Default settings loaded. Press Save to persist them.');
    }

    saveSettings() {
        this.esService.saveConfiguration(this.searchSettings);
        this.alert.addAlert('success', 'Settings saved!');
        window.history.back();
    }
}
