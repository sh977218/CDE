import { Component, Input, ViewChild, Inject, OnInit } from "@angular/core";
import { NgbModalRef, NgbModal, NgbActiveModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
@Component({
    selector: "classification-tree-view",
    providers: [NgbActiveModal],
    templateUrl: "./classificationTreeView.component.html"
})
export class ClassificationTreeViewComponent {
    @Input() public element: any;
}