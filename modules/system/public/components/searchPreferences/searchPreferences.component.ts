import { Component, OnInit } from '@angular/core';

import { AlertService } from 'alert/alert.service';
import { ElasticService } from '_app/elastic.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'cde-search-preferences',
    templateUrl: 'searchPreferences.component.html'
})
export class SearchPreferencesComponent implements OnInit {
    searchSettings: any;

    constructor(private alert: AlertService,
                public esService: ElasticService,
                private route: ActivatedRoute) {
        this.searchSettings = this.esService.searchSettings;
    }

    ngOnInit() {
        if (this.route.snapshot.queryParams['triggerClientError']) {
            throw new Error("An exception has been thrown");
        }
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
