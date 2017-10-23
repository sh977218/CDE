import { Component, Input, ViewChild, OnInit, EventEmitter, Output } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import * as _ from 'lodash';
import { OrgHelperService } from 'core/public/orgHelper.service';

@Component({
    selector: "cde-naming",
    templateUrl: "./naming.component.html"
})
export class NamingComponent {

    @ViewChild("newNamingContent") public newNamingContent: NgbModalModule;
    @Input() public elt: any;
    @Input() public canEdit: boolean = false;
    @Input() orgNamingTags: { id: string; text: string }[] = [];
    @Output() onEltChange = new EventEmitter();

    public newNaming: any = {};
    public modalRef: NgbModalRef;

    public options: Select2Options = {
        multiple: true,
        tags: true,
        language: {
            noResults: () => {
                return "No Tags found, Tags are managed in Org Management > List Management";
            }
        }
    };

    constructor(public modalService: NgbModal) {
    }

    openNewNamingModal() {
        this.modalRef = this.modalService.open(this.newNamingContent, {size: "lg"});
        this.modalRef.result.then(() => this.newNaming = {}, () => {
        });
    }

    addNewNaming() {
        this.elt.naming.push(this.newNaming);
        this.modalRef.close();
        this.onEltChange.emit();
    }

    removeNamingByIndex(index) {
        this.elt.naming.splice(index, 1);
        this.onEltChange.emit();
    }

    changedTags(name, data: { value: string[] }) {
        name.tags = data.value;
        this.onEltChange.emit();
    }

}
