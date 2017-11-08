import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModalRef, NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "cde-identifiers",
    providers: [NgbActiveModal],
    templateUrl: "./identifiers.component.html"
})
export class IdentifiersComponent {

    @ViewChild("newIdentifierContent") public newIdentifierContent: NgbModalModule;
    @Input() public elt: any;
    @Input() public canEdit: boolean = false;
    @Output() onEltChange = new EventEmitter();
    public modalRef: NgbModalRef;
    public newIdentifier: any = {};

    constructor(public modalService: NgbModal) {
    }

    openNewIdentifierModal() {
        this.modalRef = this.modalService.open(this.newIdentifierContent, {size: "lg"});
        this.modalRef.result.then(() => this.newIdentifier = {}, () => {
        });
    }

    addNewIdentifier() {
        this.elt.ids.push(this.newIdentifier);
        this.onEltChange.emit();
        this.modalRef.close();
    }

    removeIdentifierByIndex(index) {
        this.elt.ids.splice(index, 1);
        this.onEltChange.emit();
    }
}
