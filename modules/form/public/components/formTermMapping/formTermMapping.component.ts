import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { Subject } from "rxjs/Subject";
import { Http } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import { IsAllowedService } from 'core/public/isAllowed.service';
import { UserService } from 'core/public/user.service';
import { AlertService } from 'system/public/components/alert/alert.service';

@Component({
    selector: "cde-form-term-mapping",
    templateUrl: "./formTermMapping.component.html"
})

export class FormTermMappingComponent implements OnInit {

    constructor(public isAllowedModel: IsAllowedService,
                public userService: UserService,
                public modalService: NgbModal,
                private http: Http,
                private alert: AlertService
    ) {}

    @Input() elt: any;
    @ViewChild("newTermMap") public newTermMap: NgbModalModule;

    private searchTerms = new Subject<string>();
    meshTerm: string;
    descriptor: {name: string, id: string};
    flatMeshSimpleTrees: any[] = [];
    mapping: any = {meshDescriptors: []};
    descToName: any = {};

    openAddTermMap () {
        this.meshTerm = "";
        this.descriptor = null;
        this.modalService.open(this.newTermMap, {size: "lg"}).result.then(() => {}, () => {});
    }

    ngOnInit () {
        this.searchTerms
            .debounceTime(300)
            .distinctUntilChanged()
            .switchMap(term => term
                ? this.http.get((window as any).meshUrl + "/api/search/record?searchInField=termDescriptor"
                    + "&searchType=exactMatch&q=" + term).map(res => res.json())
                : Observable.of<string[]>([])
            )
            .subscribe((res) => {
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

    reloadMeshTerms () {
        this.mapping.eltId = this.elt.tinyId;
        this.flatMeshSimpleTrees = [];
        this.http.get('/meshByEltId/' + this.elt.tinyId).map(r => r.json()).subscribe(response => {
            if (response.eltId) this.mapping = response;
            if (response.flatTrees) {
                response.flatTrees.forEach(t => {
                    if (this.flatMeshSimpleTrees.indexOf(t.split(";").pop()) === -1)
                        this.flatMeshSimpleTrees.push(t.split(";").pop());
                });
            }
            this.mapping.meshDescriptors.forEach(desc => {
                this.http.get((window as any).meshUrl + "/api/record/ui/" + desc).map(r => r.json()).subscribe(res => {
                    this.descToName[desc] = res.DescriptorName.String.t;
                });
            });
        }, function () {});
    }

    addMeshDescriptor () {
        this.mapping.meshDescriptors.push(this.descriptor.id);

        this.http.post("/meshClassification", this.mapping).subscribe(response => {
            this.alert.addAlert("success", "Saved");
            this.mapping = response;
            this.reloadMeshTerms();
        }, () => {
            this.alert.addAlert("danger", "There was an issue saving this record.");
        });
    };

    removeMeshDescriptor (i) {
        this.mapping.meshDescriptors.splice(i, 1);
        this.http.post("/meshClassification", this.mapping).subscribe(response => {
            this.alert.addAlert("success", "Saved");
            this.mapping = response;
            this.reloadMeshTerms();
        }, () => {
            this.alert.addAlert("danger", "There was an issue saving this record.");
        });
    }

    isDescriptorAlreadyMapped (desc) {
        return this.mapping.meshDescriptors.findIndex(e => e === desc) > -1;
    };

    loadDescriptor  () {
        this.searchTerms.next(this.meshTerm);
    };
}