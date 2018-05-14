import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertService } from '_app/alert/alert.service';
import { IdentifierSourcesResolve } from 'system/public/components/searchPreferences/identifier-source.resolve.service';
import { ElasticService } from '_app/elastic.service';

@Component({
    selector: 'cde-table-view-preferences',
    templateUrl: 'cdeTableViewPreferences.component.html'
})
export class CdeTableViewPreferencesComponent {
    identifierSources = [];
    @Input() searchSettings;
    @Output() onChanged = new EventEmitter();

    constructor(private alert: AlertService,
                public esService: ElasticService,
                private identifierSourceSvc: IdentifierSourcesResolve) {
        this.identifierSources = this.identifierSourceSvc.identifierSources;
    }

    loadDefault() {
        this.searchSettings = this.esService.getDefault();
        this.alert.addAlert('info', 'Default settings loaded. Press Save to persist them.');
        this.onChanged.emit();
    }
}
