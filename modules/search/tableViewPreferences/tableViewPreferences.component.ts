import { Component, EventEmitter, Output, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA } from '@angular/material';
import { ElasticService } from '_app/elastic.service';
import { AlertService } from 'alert/alert.service';
import { UserSearchSettings } from 'shared/models.model';

export class TableViewPreferencesComponent {
    @Output() onChanged = new EventEmitter();
    @Output() onClosed = new EventEmitter();
    identifierSources: string[] = [];
    searchSettings: UserSearchSettings;
    placeHolder = 'Optional: select identifiers to include (default: all)';

    constructor(@Inject(MAT_DIALOG_DATA) data: {searchSettings: UserSearchSettings},
                private alert: AlertService,
                private http: HttpClient) {
        this.http.get<string[]>('/identifierSources').subscribe(idSources => this.identifierSources = idSources);
        this.searchSettings = data.searchSettings;
    }

    loadDefault() {
        this.searchSettings = ElasticService.getDefault();
        this.alert.addAlert('info', 'Default settings loaded. Press Save to persist them.');
        this.onChanged.emit();
    }
}
