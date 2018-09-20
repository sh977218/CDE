import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { UserService } from '_app/user.service';
import { AlertService } from '_app/alert.service';
import { IsAllowedService } from 'core/isAllowed.service';
import { ElasticQueryResponse } from 'shared/models.model';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'cde-form-term-mapping',
    templateUrl: './formTermMapping.component.html'
})
export class FormTermMappingComponent implements OnInit {
    @Input() elt: any;
    @ViewChild('newTermMap') public newTermMap: TemplateRef<any>;
    descriptor: { name: string, id: string };
    descToName: any = {};
    flatMeshSimpleTrees: any[] = [];
    mapping: any = {meshDescriptors: []};
    meshTerm: string;
    private searchTerms = new Subject<string>();

    constructor(private alert: AlertService,
                private http: HttpClient,
                public isAllowedModel: IsAllowedService,
                public dialog: MatDialog,
                public userService: UserService) {
    }

    ngOnInit() {
        this.searchTerms.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => term
                ? this.http.get((window as any).meshUrl
                    + '/api/search/record?searchInField=termDescriptor&searchType=exactMatch&q=' + term)
                : EmptyObservable.create<string[]>()
            )
        ).subscribe((res: ElasticQueryResponse) => {
            if (res && res.hits && res.hits.hits.length === 1) {
                let desc = res.hits.hits[0]._source;
                this.descriptor = {name: desc.DescriptorName.String.t, id: desc.DescriptorUI.t};
            }
            else {
                this.descriptor = null;
            }
        });
        this.reloadMeshTerms();
    }

    addMeshDescriptor() {
        this.mapping.meshDescriptors.push(this.descriptor.id);

        this.http.post('/server/mesh/meshClassification', this.mapping).subscribe(response => {
            this.alert.addAlert('success', 'Saved');
            this.mapping = response;
            this.reloadMeshTerms();
        }, () => {
            this.alert.addAlert('danger', 'There was an issue saving this record.');
        });
    }

    loadDescriptor() {
        this.searchTerms.next(this.meshTerm);
    }

    openAddTermMap() {
        this.meshTerm = '';
        this.descriptor = null;
        this.dialog.open(this.newTermMap, {width: '800px'});
    }

    reloadMeshTerms() {
        this.mapping.eltId = this.elt.tinyId;
        this.flatMeshSimpleTrees = [];
        this.http.get<any>('/server/mesh/eltId/' + this.elt.tinyId).subscribe(response => {
            if (!response) return this.alert.addAlert('danger', 'There was an issue getting Mesh Terms.');

            if (response.eltId) this.mapping = response;
            if (response.flatTrees) {
                response.flatTrees.forEach(t => {
                    if (this.flatMeshSimpleTrees.indexOf(t.split(';').pop()) === -1) {
                        this.flatMeshSimpleTrees.push(t.split(';').pop());
                    }
                });
            }
            this.mapping.meshDescriptors.forEach(desc => {
                this.http.get<any>((window as any).meshUrl + '/api/record/ui/' + desc).subscribe(res => {
                    this.descToName[desc] = res.DescriptorName.String.t;
                });
            });
        }, function () {
        });
    }

    removeMeshDescriptor(i) {
        this.mapping.meshDescriptors.splice(i, 1);
        this.http.post('/server/mesh/meshClassification', this.mapping).subscribe(response => {
            this.alert.addAlert('success', 'Saved');
            this.mapping = response;
            this.reloadMeshTerms();
        }, () => {
            this.alert.addAlert('danger', 'There was an issue saving this record.');
        });
    }
}
