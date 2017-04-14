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

    upload (event) {
        if (event.srcElement.files) {
            let files = event.srcElement.files;
            let formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append("uploadedFiles", files[i]);
            }
            this.http.post("/attachments/" + this.elt.elementType + "/add", formData).subscribe(
                r => this.Alert.addAlert("success", r.text()));
        }
    }

//     $scope.setFiles = function (element) {
//     $timeout(function () {
//         $scope.$apply(function ($scope) {
//             // Turn the FileList object into an Array
//             $scope.files = [];
//             for (var i = 0; i < element.files.length; i++) {
//                 if (element.files[i].size > (5 * 1024 * 1024)) {
//                     $scope.message = "Size is limited to 5Mb per attachment";
//                 } else {
//                     $scope.files.push(element.files[i]);
//                 }
//             }
//             $scope.progressVisible = false;
//         });
//     }, 0);
// };

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