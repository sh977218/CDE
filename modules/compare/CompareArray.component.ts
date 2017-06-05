import { Component, Input, OnInit, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbActiveModal, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { CompareService } from "../core/public/compare.service";

@Component({
    selector: "cde-compare-array",
    templateUrl: "./compareArray.component.html",
    styles: [`
        :host .arrayObj {
            background-color: #f5f5f5;
            border: 1px solid #ccc;
            padding: 9.5px;
            margin: 0 0 10px;
        }`]
})
export class CompareArrayComponent implements OnInit {
    @Input() left;
    @Input() right;
    public compareArrayOption = [
        {
            label: "Naming",
            equal: function (a, b) {
                return a.designation === b.designation;
            },
            sort: function (a, b) {
                return a.designation.localeCompare(b.designation);
            },
            property: "naming",
            data: [
                {label: 'Name', property: 'designation'},
                {label: 'Definition', property: 'definition'},
                {label: 'Tags', property: 'tags', array: true}
            ]
        }/*,
        {
            label: "Reference Documents",
            equal: function (a, b) {
                return a.title === b.title;
            },
            sort: function (a, b) {
                return a.title.localeCompare(b.title);
            },
            property: "referenceDocuments",
            data: [
                {label: 'Title', property: 'title'},
                {label: 'URI', property: 'uri'},
                {label: 'Provider Org', property: 'providerOrg'},
                {label: 'Language Code', property: 'languageCode'},
                {label: 'Document', property: 'document'}
            ]
        },
        {
            label: "Properties",
            equal: function (a, b) {
                return a.key === b.key;
            },
            sort: function (a, b) {
                return a.key.localeCompare(b.key);
            },
            property: "properties",
            data: [
                {label: 'Key', property: 'key'},
                {label: 'Value', property: 'value'}
            ]
        }*/
    ];


    constructor(public compareService: CompareService) {
    }

    ngOnInit(): void {
        this.compareService.doCompareArray(this.left, this.right, this.compareArrayOption)
    }
}
