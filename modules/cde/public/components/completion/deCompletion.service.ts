import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ElasticService } from '_app/elastic.service';
import { AlertService } from 'alert/alert.service';
import { empty } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DataElement } from 'shared/de/dataElement.model';
import { SearchSettings } from 'shared/search/search.model';

@Injectable()
export class DeCompletionService {
    private searchSettings = new SearchSettings();
    private searchTerms = new Subject<string>();
    suggestedCdes: DataElement[] = [];

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
                    return this.http.post<any[]>('/server/de/completion/' + encodeURI(term), settings);
                } else {
                    return empty();
                }
            })
        ).subscribe(res => {
            const tinyIdList = res.map(r => r._id).slice(0, 5);
            if (tinyIdList && tinyIdList.length > 0) {
                this.http.get<any[]>('/server/de/list/' + tinyIdList).subscribe(result => {
                    this.suggestedCdes = result;
                }, err => this.alert.httpErrorMessageAlert(err));
            } else { this.suggestedCdes = []; }
        });
    }

    next(term: string) {
        this.searchTerms.next(term);
    }
}
