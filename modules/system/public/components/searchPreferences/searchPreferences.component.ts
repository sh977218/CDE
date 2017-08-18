import { Component, Inject, OnInit } from "@angular/core";
import { AlertService } from "../alert/alert.service";

@Component({
    selector: "cde-search-preferences",
    templateUrl: "searchPreferences.component.html"
})

export class SearchPreferencesComponent implements OnInit {

    constructor(@Inject('SearchSettings') public SearchSettings,
                private alert: AlertService) {}

    searchSettings: any = {tableViewFields: {}};

    ngOnInit () {
        this.SearchSettings.getPromise().then(settings => {
            this.searchSettings = settings;
        });
    }

    saveSettings () {
        this.SearchSettings.saveConfiguration(this.searchSettings);
        this.alert.addAlert("success", "Settings saved!");
        window.history.back();
    };

    cancelSettings () {
        this.alert.addAlert("warning", "Cancelled...");
        window.history.back();
    };

    loadDefault = function () {
        let defaultSettings = this.SearchSettings.getDefault();
        Object.keys(defaultSettings).forEach(key => {
            this.searchSettings[key] = defaultSettings[key];
        });
        this.alert.addAlert("info", "Default settings loaded. Press Save to persist them.");
    };

}