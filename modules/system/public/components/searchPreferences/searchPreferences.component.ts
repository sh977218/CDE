import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { ElasticService } from '_app/elastic.service';
import { AlertService } from '_app/alert/alert.service';
import { IdentifierSourcesResolve } from "./identifier-source.resolve.service";

@Component({
    selector: 'cde-search-preferences',
    templateUrl: 'searchPreferences.component.html'
})

export class SearchPreferencesComponent {
    searchSettings: any;
    identifierSources = ['NINDS', 'NINDS Variable Name', 'caDSR', 'GRDR', 'Assessment Center', 'LOINC', '(LOINC)', 'UMLS', 'TESTOrg'];
    public options = {
        multiple: true,
        tags: true
    };

    constructor(private http: Http,
                public esService: ElasticService,
                private identifierSourceSvc: IdentifierSourcesResolve,
                private alert: AlertService) {
        this.searchSettings = this.esService.searchSettings;
        this.identifierSources = this.identifierSourceSvc.identifierSources;
    }

    saveSettings() {
        this.esService.saveConfiguration(this.searchSettings);
        this.alert.addAlert('success', 'Settings saved!');
        window.history.back();
    };

    cancelSettings() {
        this.alert.addAlert('warning', 'Cancelled...');
        window.history.back();
    };

    loadDefault = function () {
        let defaultSettings = this.esService.getDefault();
        Object.keys(defaultSettings).forEach(key => {
            this.searchSettings[key] = defaultSettings[key];
        });
        this.alert.addAlert('info', 'Default settings loaded. Press Save to persist them.');
    };


    changedIdentifier(searchSettings, data: { value: string[] }) {
        // searchSettings.tableViewFields.identifiers = data.value;
    }

}