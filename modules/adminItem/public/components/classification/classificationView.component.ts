import { Component, ViewChild, Input, Output, EventEmitter } from "@angular/core";
import { IActionMapping } from "angular-tree-component/dist/models/tree-options.model";
import { NgbModalRef, NgbModal, NgbActiveModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";

const actionMapping: IActionMapping = {
    mouse: {
        click: () => {
        },
        expanderClick: () => {
        }
    }
};
@Component({
    selector: "cde-classification-view",
    providers: [NgbActiveModal],
    templateUrl: "./classificationView.component.html"
})
export class ClassificationViewComponent {
    @ViewChild("deleteClassificationContent") public deleteClassificationContent: NgbModalModule;
    @Input() elt;
    @Input() isAllowed;
    @Output() confirmDelete = new EventEmitter();
    public modalRef: NgbModalRef;

    public options = {
        idField: "name",
        childrenField: "elements",
        displayField: "name",
        useVirtualScroll: false,
        isExpandedField: "elements",
        actionMapping: actionMapping
    };

    constructor(public modalService: NgbModal) {
    };

    searchByClassification(node, orgName) {
        let classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                classificationArray.unshift(_treeNode.data.name);
        }
        return "/" + this.elt.elementType + "/search?selectedOrg=" + encodeURIComponent(orgName) +
            "&classification=" + encodeURIComponent(classificationArray.join(";"));
    };

    openDeleteClassificationModal(node, deleteOrgName) {
        let deleteClassificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                deleteClassificationArray.unshift(_treeNode.data.name);
        }
        this.modalRef = this.modalService.open(this.deleteClassificationContent);
        this.modalRef.result.then(result => {
            if (result === "confirm") this.confirmDelete.emit({
                deleteClassificationArray: deleteClassificationArray,
                deleteOrgName: deleteOrgName
            });
        }, () => {
        });
    }
}
