import { Component, Inject, Input, ViewChild, ElementRef } from "@angular/core";
import { Http } from "@angular/http";


import "rxjs/add/operator/map";

@Component({
    selector: "cde-admin-item-attachments",
    templateUrl: "./attachments.component.html"
})


export class AttachmentsComponent {

    @Input() public elt: any;
    @ViewChild("fileInput") inputEl: ElementRef;


    constructor(
        private http: Http,
        @Inject("isAllowedModel") public isAllowedModel,
        @Inject("Alert") private Alert,
    ) {}

    upload () {
        let inputEl: HTMLInputElement = this.inputEl.nativeElement;
        let fileCount: number = inputEl.files.length;
        let formData = new FormData();
        if (fileCount > 0) {
            for (let i = 0; i < fileCount; i++) {
                formData.append("file[]", inputEl.files.item(i));
            }
            this.http.post("/attachments/" + this.elt.elementType + "/add", formData).subscribe(
                r => this.Alert.addAlert("success", r.text()));
        }
    }

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