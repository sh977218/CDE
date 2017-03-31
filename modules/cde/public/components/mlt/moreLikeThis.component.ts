import { Http } from "@angular/http";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import { Component, Inject, Input, ViewChild, OnInit } from "@angular/core";
import "rxjs/add/operator/map";

@Component({
    selector: "cde-mlt",
    templateUrl: "moreLikeThis.component.html"
})

export class MoreLikeThisComponent implements OnInit {

    @ViewChild("mltModal") public mltModal: NgbModalModule;
    @Input() elt: any;

    public modalRef: NgbModalRef;
    private cdes: any[];

    constructor(private http: Http,
        @Inject("Alert") private alert,
        public modalService: NgbModal,
        public activeModal: NgbActiveModal) {

    }

    // $scope.includeInAccordion = ["/cde/public/html/accordion/pinAccordionActions.html",
    //     "/system/public/html/accordion/addToQuickBoardActions.html"];

    ngOnInit() {
        this.http.get("/moreLikeCde/" + this.elt.tinyId).map(res => res.json()).subscribe(response => {
            this.cdes = response.cdes;
        }, () => {
            this.alert.addAlert("error", "Unable to retrieve MLT");
        });
    }

    // $scope.view = function(cde, event) {
    //     $scope.interruptEvent(event);
    //     $location.url("deview?tinyId=" + cde.tinyId);
    // };


}