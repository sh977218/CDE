import { Component, EventEmitter, Output, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from "@angular/material";

import { AlertService } from '_app/alert/alert.service';
import { IdentifierSourcesResolve } from 'system/public/components/searchPreferences/identifier-source.resolve.service';
import { ElasticService } from '_app/elastic.service';

@Component({
    template: ''
})
export class TableViewPreferencesComponent {
    identifierSources = [];
    searchSettings;
    @Output() onChanged = new EventEmitter();
    @Output() onClosed = new EventEmitter();
    placeHolder = 'Optional: select identifiers to include (default: all)';
    appendTo = 'body';

    constructor(@Inject(MAT_DIALOG_DATA) data,
                private alert: AlertService,
                public esService: ElasticService,
                private identifierSourceSvc: IdentifierSourcesResolve) {
        this.identifierSources = this.identifierSourceSvc.identifierSources;
        this.searchSettings = data.searchSettings;
    }

    loadDefault() {
        this.searchSettings = this.esService.getDefault();
        this.alert.addAlert('info', 'Default settings loaded. Press Save to persist them.');
        this.onChanged.emit();
    }
}
