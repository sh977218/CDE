import { EventEmitter, Output, Inject, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ElasticService } from '_app/elastic.service';
import { AlertService } from 'alert/alert.service';
import { Source, UserSearchSettings } from 'shared/models.model';

@Component({
    template: ''
})
export abstract class TableViewPreferencesComponent {
    @Output() changed = new EventEmitter();
    @Output() closed = new EventEmitter();
    identifierSources: string[] = [];
    searchSettings: UserSearchSettings;
    placeHolder = 'Optional: select identifiers to include (default: all)';

    constructor(@Inject(MAT_DIALOG_DATA) data: {},
                private alert: AlertService,
                public esService: ElasticService,
                private http: HttpClient) {
        this.http.get<Source[]>('/server/system/idSources').subscribe(idSources => this.identifierSources = idSources.map(x => x._id));
        this.searchSettings = this.esService.searchSettings;
    }

    loadDefault() {
        this.searchSettings = this.esService.searchSettings = ElasticService.getDefault();
        this.alert.addAlert('info', 'Default settings loaded. Press Save to persist them.');
        this.changed.emit();
    }
}
