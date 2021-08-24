import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ElasticService } from '_app/elastic.service';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { LocalStorageService } from 'non-core/localStorage.service';
import { UserSearchSettings } from 'shared/models.model';
import { isOrgAuthority } from 'shared/security/authorizationShared';

@Component({
    selector: 'cde-search-preferences',
    templateUrl: 'searchPreferences.component.html'
})
export class SearchPreferencesComponent implements OnInit {
    exportToTab: string = '';
    isOrgAuthority = isOrgAuthority;

    constructor(
        private route: ActivatedRoute,
        private alert: AlertService,
        public esService: ElasticService,
        private localStorageService: LocalStorageService,
        public userService: UserService
    ) {
        this.exportToTab = localStorageService.getItem('exportToTab');
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
        this.esService.searchSettings = ElasticService.getDefault();
        this.exportToTab = '';
        this.alert.addAlert('info', 'Default settings loaded. Press Save to persist them.');
    }

    saveSettings() {
        this.esService.saveConfiguration();
        this.localStorageService.setItem('exportToTab', this.exportToTab);
        this.alert.addAlert('success', 'Settings saved!');
        window.history.back();
    }

    get searchSettings(): UserSearchSettings {
        return this.esService.searchSettings;
    }
}
