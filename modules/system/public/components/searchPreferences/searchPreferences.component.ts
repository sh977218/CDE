import { Component } from "@angular/core";
import { Http } from "@angular/http";
import { ElasticService } from '_app/elastic.service';
import { AlertService } from '_app/alert/alert.service';

@Component({
    selector: "cde-search-preferences",
    templateUrl: "searchPreferences.component.html"
})

export class SearchPreferencesComponent {
    searchSettings: any;
    allIdentifiers = [];

    constructor(private http: Http,
                public esService: ElasticService,
                private alert: AlertService) {
        this.searchSettings = this.esService.searchSettings;
        this.http.get('/identifiersSource').map(res => res.json()).subscribe(res => {
            this.allIdentifiers = res;
        }, err => this.alert.addAlert('danger', err));
    }

    saveSettings() {
        this.esService.saveConfiguration(this.searchSettings);
        this.alert.addAlert("success", "Settings saved!");
        window.history.back();
    };

    cancelSettings() {
        this.alert.addAlert("warning", "Cancelled...");
        window.history.back();
    };

    loadDefault = function () {
        let defaultSettings = this.esService.getDefault();
        Object.keys(defaultSettings).forEach(key => {
            this.searchSettings[key] = defaultSettings[key];
        });
        this.alert.addAlert("info", "Default settings loaded. Press Save to persist them.");
    };

}