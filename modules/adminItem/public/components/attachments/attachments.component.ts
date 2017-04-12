import { Component, Inject, Input } from "@angular/core";
import "rxjs/add/operator/map";

@Component({
    selector: "cde-admin-item-attachments",
    templateUrl: "./attachments.component.html"
})


export class AttachmentsComponent {

    constructor(
        @Inject("isAllowedModel") public isAllowedModel
    ) {}

    // copyUrl (attachment) {
    //     let url = window.publicUrl + "/data/" + attachment.fileid;
    //     let copyElement = document.createElement('input');
    //     copyElement.setAttribute('type', 'text');
    //     copyElement.setAttribute('value', url);
    //     copyElement = document.body.appendChild(copyElement);
    //     copyElement.select();
    //     try {
    //         if (!document.execCommand('copy')) throw 'Not allowed.';
    //     } catch (e) {
    //         copyElement.remove();
    //         console.log("document.execCommand('copy'); is not supported");
    //         prompt('Copy the text below. (ctrl c, enter)', url);
    //     } finally {
    //         if (typeof e == 'undefined') {
    //             copyElement.remove();
    //         }
    //     }
    // }

}