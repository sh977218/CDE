import { Component, OnInit } from "@angular/core";
import { AlertService } from "../alert/alert.service";
import { ElasticService } from 'core/public/elastic.service';

@Component({
    selector: "cde-search-preferences",
    templateUrl: "searchPreferences.component.html"
})

export class SearchPreferencesComponent implements OnInit {

    constructor(public esService: ElasticService,
                private alert: AlertService) {}

    searchSettings: any = {tableViewFields: {}};

    ngOnInit () {
        this.esService.then(() => {
            this.searchSettings = this.esService.searchSettings;
        });
    }

    saveSettings () {
        this.esService.saveConfiguration(this.searchSettings);
        this.alert.addAlert("success", "Settings saved!");
        window.history.back();
    };

    cancelSettings () {
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