import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { ElasticQueryResponse, MeshClassification } from 'shared/models.model';

interface Descriptor {
    id: string;
    name: string;
}

@Component({
    selector: 'cde-form-term-mapping',
    templateUrl: './formTermMapping.component.html'
})
export class FormTermMappingComponent implements OnInit {
    @Input() elt: any;
    @ViewChild('newTermMap') public newTermMap!: TemplateRef<any>;
    descriptor?: Descriptor;
    descToName: any = {};
    flatMeshSimpleTrees: any[] = [];
    mapping: MeshClassification = {meshDescriptors: []};
    meshTerm?: string;
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
                ? this.http.get<ElasticQueryResponse<any>>((window as any).meshUrl
                    + '/api/search/record?searchInField=termDescriptor&searchType=exactMatch&q=' + term)
                : EmptyObservable.create<ElasticQueryResponse<any>>()
            )
        ).subscribe((res) => {
            if (res && res.hits && res.hits.hits.length === 1) {
                const desc = res.hits.hits[0]._source;
                this.descriptor = {name: desc.DescriptorName.String.t, id: desc.DescriptorUI.t};
            } else {
                this.descriptor = undefined;
            }
        });
        this.reloadMeshTerms();
    }

    addMeshDescriptor(descriptor: Descriptor) {
        this.mapping.meshDescriptors.push(descriptor.id);

        this.http.post<MeshClassification>('/server/mesh/meshClassification', this.mapping).subscribe(response => {
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
        this.descriptor = undefined;
        this.dialog.open(this.newTermMap, {width: '800px'});
    }

    reloadMeshTerms() {
        this.mapping.eltId = this.elt.tinyId;
        this.flatMeshSimpleTrees = [];
        this.http.get<MeshClassification>('/server/mesh/eltId/' + this.elt.tinyId).subscribe(response => {
            if (!response) { return this.alert.addAlert('danger', 'There was an issue getting Mesh Terms.'); }

            if (response.eltId) { this.mapping = response; }
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
        }, () => {
        });
    }

    removeMeshDescriptor(i: number) {
        this.mapping.meshDescriptors.splice(i, 1);
        this.http.post<MeshClassification>('/server/mesh/meshClassification', this.mapping).subscribe(response => {
            this.alert.addAlert('success', 'Saved');
            this.mapping = response;
            this.reloadMeshTerms();
        }, () => {
            this.alert.addAlert('danger', 'There was an issue saving this record.');
        });
    }
}
