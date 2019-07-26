import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { AlertService } from 'alert/alert.service';
import { ElasticService } from '_app/elastic.service';
import { SearchSettings } from 'search/search.model';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class DeCompletionService {
    private searchSettings = new SearchSettings;
    private searchTerms = new Subject<string>();
    suggestedCdes = [];

    constructor(private alert: AlertService,
                private elasticService: ElasticService,
                private http: HttpClient) {
        const settings = this.elasticService.buildElasticQuerySettings(this.searchSettings);
        this.searchTerms.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => {
                if (term) {
                    settings.resultPerPage = 5;
                    settings.searchTerm = term;
                    return this.http.post<any[]>('/cdeCompletion/' + encodeURI(term), settings);
                } else {
                    return EmptyObservable.create<string[]>();
                }
            })
        ).subscribe(res => {
            const tinyIdList = res.map(r => r._id).slice(0, 5);
            if (tinyIdList && tinyIdList.length > 0) {
                this.http.get<any[]>('/deList/' + tinyIdList).subscribe(result => {
                    this.suggestedCdes = result;
                }, err => this.alert.httpErrorMessageAlert(err));
            } else { this.suggestedCdes = []; }
        });
    }

    next(term) {
        this.searchTerms.next(term);
    }
}
