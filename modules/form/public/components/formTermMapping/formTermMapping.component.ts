import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { Subject } from "rxjs/Subject";
import { Http } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { Alert } from "selenium-webdriver";

@Component({
    selector: "cde-form-term-mapping",
    templateUrl: "./formTermMapping.component.html"
})

export class FormTermMappingComponent implements OnInit {

    constructor(@Inject("isAllowedModel") public isAllowedModel,
                @Inject("userResource") public userService,
                public modalService: NgbModal,
                private http: Http,
                private Alert: Alert
    ) {}

    @Input() elt: any;

    @ViewChild("newTermMap") public newTermMap: NgbModalModule;

    private searchTerms = new Subject<string>();
    meshTerm: string;

    descriptor: {name: string, id: string};

    openAddTermMap () {
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
                if (res.hits.hits.length === 1) {
                    let desc = res.hits.hits[0]._source;
                    this.descriptor = {name: desc.DescriptorName.String.t, id: desc.DescriptorUI.t};
                }
                else {
                    this.descriptor = null;
                }
            });
    }

    addMeshDescriptor () {
        $scope.mapping.meshDescriptors.push($scope.descriptorID);
        $scope.descToName[$scope.descriptorID] = $scope.descriptorName;
        delete $scope.descriptorID;
        delete $scope.descriptorName;

        $http.post("/meshClassification", $scope.mapping).then(function onSuccess(response) {
            Alert.addAlert("success", "Saved");
            $scope.mapping = response.data;
        }).catch(function onError() {
            Alert.addAlert("danger", "There was an issue saving this record.");
        });
    };

    isDescriptorAlreadyMapped (desc) {
        // return this.elt.termAnnotations.findIndex(e => e.code === desc) > -1;
    };

    loadDescriptor  () {
        this.searchTerms.next(this.meshTerm);
    };

}