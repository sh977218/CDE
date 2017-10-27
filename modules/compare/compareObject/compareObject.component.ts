import { Component, Input, OnInit } from "@angular/core";
import "rxjs/add/operator/map";
import { CompareService } from "../../core/compare.service";
import { ClassificationService } from "../../core/classification.service";
import * as _ from "lodash";

@Component({
    selector: "cde-compare-object",
    templateUrl: "./compareObject.component.html"
})
export class CompareObjectComponent implements OnInit {

    @Input() older;
    @Input() newer;
    map = {
        "Text": "valueDomain.datatypeText"
    };
    public compareObjectProperties = [
        {label: "Steward Org", match: false, property: "stewardOrg.name"},
        {label: "Version", match: false, property: "version"},
        {label: "Status", match: false, property: "registrationState.registrationStatus"},
        {label: "Unit of Measure", match: false, property: "valueDomain.uom"},
        {label: "Data Type", match: false, property: "valueDomain.datatype"},
        {
            label: "Data Type Text", match: false, property: "valueDomain.datatypeText",
            data: [
                {label: "Data Type Text Minimal Length", match: false, property: "minLength"},
                {label: "Data Type Text Maximal Length", match: false, property: "maxLength"},
                {label: "Data Type Text Regex", match: false, property: "regex"},
                {label: "Data Type Text Rule", match: false, property: "rule"},
            ]
        }, {
            label: "Data Type Number", match: false, property: "valueDomain.datatypeNumber",
            data: [
                {label: "Data Type Number Minimal Value", match: false, property: "minValue"},
                {label: "Data Type Number Maximal Value", match: false, property: "maxValue"},
                {label: "Data Type Number Precision", match: false, property: "precision"}
            ]
        }, {
            label: "Data Type Date", match: false, property: "valueDomain.datatypeDate",
            data: [
                {label: "Data Type Date Format", match: false, property: "format"}
            ]
        }, {
            label: "Data Type Time", match: false, property: "valueDomain.datatypeTime",
            data: [
                {label: "Data Type Time Format", match: false, property: "format"}
            ]
        }
    ];

    constructor(public compareService: CompareService, public ClassificationService: ClassificationService) {
    }

    ngOnInit(): void {
        this.newer = _.cloneDeep(this.newer);
        this.older = _.cloneDeep(this.older);
        this.ClassificationService.sortClassification(this.newer);
        this.ClassificationService.sortClassification(this.older);
        this.newer.flatClassifications = this.ClassificationService.flattenClassification(this.newer).join(",");
        this.older.flatClassifications = this.ClassificationService.flattenClassification(this.older).join(",");
        this.compareService.doCompareObject(this.older, this.newer, this.compareObjectProperties);
    }
}