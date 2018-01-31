import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { AlertService } from '_app/alert/alert.service';
import { ElasticService } from '_app/elastic.service';
import { IdentifierSourcesResolve } from 'system/public/components/searchPreferences/identifier-source.resolve.service';


@Component({
    selector: 'cde-search-preferences',
    templateUrl: 'searchPreferences.component.html'
})
export class SearchPreferencesComponent implements OnInit {
    identifierSources = [];
    loadDefault = function () {
        let defaultSettings = this.esService.getDefault();
        Object.keys(defaultSettings).forEach(key => {
            this.searchSettings[key] = defaultSettings[key];
        });
        this.alert.addAlert('info', 'Default settings loaded. Press Save to persist them.');
    };
    options = {
        multiple: true,
        tags: true,
        placeholder: 'Optional: select identifiers to include (default: all)'
    };
    searchSettings: any;

    ngOnInit(): void {
        this.identifierSources = this.identifierSourceSvc.identifierSources;
    }

    constructor(
        private alert: AlertService,
        public esService: ElasticService,
        private http: HttpClient,
        private identifierSourceSvc: IdentifierSourcesResolve,
    ) {
        this.searchSettings = this.esService.searchSettings;
    }

    cancelSettings() {
        this.alert.addAlert('warning', 'Cancelled...');
        window.history.back();
    }

    changedIdentifier(searchSettings, data: { value: string[] }) {
        searchSettings.tableViewFields.identifiers = data.value;
    }

    saveSettings() {
        this.esService.saveConfiguration(this.searchSettings);
        this.alert.addAlert('success', 'Settings saved!');
        window.history.back();
    }
}
