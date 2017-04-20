import { Component, Inject, Input, ViewChild, ElementRef, ChangeDetectorRef } from "@angular/core";
import { Http } from "@angular/http";


import "rxjs/add/operator/map";

@Component({
    selector: "cde-admin-item-attachments",
    templateUrl: "./attachments.component.html"
})


export class AttachmentsComponent {

    @Input() public elt: any;
    @ViewChild("fileInput") inputEl: ElementRef;

    showDelete: boolean = false;

    constructor(
        private http: Http,
        private ref: ChangeDetectorRef,
        @Inject("isAllowedModel") public isAllowedModel,
        @Inject("Alert") private alert
    ) {}

    upload (event) {
        if (event.srcElement.files) {
            let files = event.srcElement.files;
            let formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append("uploadedFiles", files[i]);
            }
            formData.append("id", this.elt._id);
            this.http.post("/attachments/" + this.elt.elementType + "/add", formData).map(r => r.json()).subscribe(
                r => {
                    if (r.message) this.alert.addAlert("info", r.text());
                    else {
                        this.elt = r;
                        this.alert.addAlert("success", "Attachment added.");
                        this.ref.detectChanges();
                    }
                }
            );
        }
    }

    setDefault (index) {
        this.http.post("/attachments/" + this.elt.elementType + "/setDefault",
            {
                index: index
                , state: this.elt.attachments[index].isDefault
                , id: this.elt._id
            }).map(r => r.json()).subscribe(res => {
                this.elt = res;
                this.alert.addAlert("success", "Saved");
                this.ref.detectChanges();
        });
    }

    copyUrl (attachment) {
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

    removeAttachment (index) {
        this.http.post("/attachments/" + this.elt.elementType + "/remove", {
            index: index
            , id: this.elt._id
        }).map(r => r.json()).subscribe(res => {
            this.elt = res;
            this.alert.addAlert("success", "Attachment Removed.");
            this.ref.detectChanges();
        });
    }


}