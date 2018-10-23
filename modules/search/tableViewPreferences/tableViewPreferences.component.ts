import { Component, EventEmitter, Output, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA } from "@angular/material";

import { AlertService } from 'alert/alert.service';
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

    constructor(@Inject(MAT_DIALOG_DATA) data,
                private http: HttpClient,
                private alert: AlertService,
                public esService: ElasticService) {
        this.http.get<any[]>('/identifierSources').subscribe(idSources => this.identifierSources = idSources);
        this.searchSettings = data.searchSettings;
    }

    loadDefault() {
        this.searchSettings = this.esService.getDefault();
        this.alert.addAlert('info', 'Default settings loaded. Press Save to persist them.');
        this.onChanged.emit();
    }
}
