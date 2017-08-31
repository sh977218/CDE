import {
    Component, Inject, Input, ViewChild, ElementRef, ChangeDetectorRef, EventEmitter,
    Output
} from "@angular/core";
import { Http } from "@angular/http";


import "rxjs/add/operator/map";
import { AlertService } from "../../../../system/public/components/alert/alert.service";

@Component({
    selector: "cde-attachments",
    templateUrl: "./attachments.component.html"
})
export class AttachmentsComponent {
    @ViewChild("fileInput") inputEl: ElementRef;

    @Input() public elt: any;
    @Output() public removeAttachment = new EventEmitter();
    @Output() public setDefault = new EventEmitter();
    @Output() public upload = new EventEmitter();

    showDelete: boolean = false;

    constructor(private http: Http,
                private ref: ChangeDetectorRef,
                @Inject("isAllowedModel") public isAllowedModel,
                private alert: AlertService) {
    }

    copyUrl(attachment) {
        let url = (window as any).publicUrl + "/data/" + attachment.fileid;
        let copyElement = document.createElement("input");
        copyElement.setAttribute("type", "text");
        copyElement.setAttribute("value", url);
        document.body.appendChild(copyElement);
        copyElement.select();
        try {
            if (!document.execCommand("copy")) throw "Not allowed.";
            copyElement.remove();
        } catch (e) {
            copyElement.remove();
            prompt("Copy the text below. (ctrl c, enter)", url);
        }
    }
}