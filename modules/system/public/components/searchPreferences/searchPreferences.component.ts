import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ElasticService } from '_app/elastic.service';
import { AlertService } from 'alert/alert.service';
import { LocalStorageService } from 'non-core/localStorage.service';
import { UserSearchSettings } from 'shared/models.model';

@Component({
    selector: 'cde-search-preferences',
    templateUrl: 'searchPreferences.component.html'
})
export class SearchPreferencesComponent implements OnInit {
    exportToTab: string = '';
    searchSettings: UserSearchSettings;

    constructor(
        private route: ActivatedRoute,
        private alert: AlertService,
        public esService: ElasticService,
        private localStorageService: LocalStorageService
    ) {
        this.exportToTab = localStorageService.getItem('exportToTab');
        this.searchSettings = this.esService.searchSettings;
    }

    ngOnInit() {
        if (this.route.snapshot.queryParams.triggerClientError) {
            throw new Error('An exception has been thrown');
        }
    }

    cancelSettings() {
        this.alert.addAlert('warning', 'Cancelled...');
        window.history.back();
    }

    loadDefault() {
        Object.assign(this.searchSettings, ElasticService.getDefault());
        this.exportToTab = '';
        this.alert.addAlert('info', 'Default settings loaded. Press Save to persist them.');
    }

    saveSettings() {
        this.esService.saveConfiguration(this.searchSettings);
        this.localStorageService.setItem('exportToTab', this.exportToTab);
        this.alert.addAlert('success', 'Settings saved!');
        window.history.back();
    }
}
