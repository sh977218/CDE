import { Http } from "@angular/http";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { PinModalComponent } from "../../../../board/public/components/pinModal/pinModal.component";

@Component({
    selector: "cde-mlt",
    templateUrl: "moreLikeThis.component.html",
    providers: [NgbActiveModal]
})

export class MoreLikeThisComponent implements OnInit {

    @ViewChild("mltModal") public mltModal: NgbModalModule;
    @ViewChild("pinModal") public pinModal: PinModalComponent;
    @Input() elt: any;

    public modalRef: NgbModalRef;
    private cdes: any[];

    constructor(private http: Http,
        @Inject("Alert") private alert,
        public modalService: NgbModal,
    ) {

    }

    open () {
        this.http.get("/moreLikeCde/" + this.elt.tinyId).map(res => res.json()).subscribe(response => {
            this.cdes = response.cdes;
        }, () => {
            this.alert.addAlert("error", "Unable to retrieve MLT");
        });

        this.modalRef = this.modalService.open(this.mltModal, {size: "lg"});
    }

    ngOnInit() {
        console.log("where are we ?");
    }

    ngAfterViewInit() {
        console.log("is the view ready ?");
    }


    // $scope.includeInAccordion = ["/cde/public/html/accordion/pinAccordionActions.html",
    //     "/system/public/html/accordion/addToQuickBoardActions.html"];


    // $scope.view = function(cde, event) {
    //     $scope.interruptEvent(event);
    //     $location.url("deview?tinyId=" + cde.tinyId);
    // };


}