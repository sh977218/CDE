import { Component, Input, ChangeDetectorRef, EventEmitter, Output } from "@angular/core";
import "rxjs/add/operator/map";

@Component({
    selector: "cde-attachments",
    templateUrl: "./attachments.component.html"
})
export class AttachmentsComponent {
    @Input() public elt: any;
    @Input() public canEdit: boolean = false;
    @Output() public removeAttachment = new EventEmitter();
    @Output() public setDefault = new EventEmitter();
    @Output() public upload = new EventEmitter();

    // showDelete: boolean = false;

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