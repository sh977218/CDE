import { Component, Input, OnInit, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbActiveModal, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { CompareService } from "../core/public/compare.service";
import * as _ from "lodash";

@Component({
    selector: "cde-compare-array",
    templateUrl: "./compareArray.component.html",
    styles: [`
        :host .arrayObj {
            background-color: #f5f5f5;
            border: 1px solid #ccc;
            padding: 9.5px;
            margin: 0 0 10px;
        }

        :host .diff {
            background-color: rgba(242, 217, 217, 0.5);
        }`]
})
export class CompareArrayComponent implements OnInit {
    @Input() left;
    @Input() right;
    public compareArrayOption = [
        {
            label: "Questions",
            isEqual: function (a, b) {
                if (_.isEmpty(a.diff)) a.diff = [];
                if (_.isEmpty(b.diff)) b.diff = [];
                let result = _.isEqual(a.question.cde.tinyId, b.question.cde.tinyId);
                if (result) {
                    if (!_.isEqual(a.label, b.label)) {
                        a.diff.push("label");
                        b.diff.push("label");
                        a.display = true;
                        b.display = true;
                    }
                    if (!_.isEqual(a.question.uoms, b.question.uoms)) {
                        a.diff.push("question.uom");
                        b.diff.push("question.uom");
                        a.display = true;
                        b.display = true;
                    }
                    if (!_.isEqual(a.question.answers, b.question.answers)) {
                        a.diff.push("question.answers");
                        b.diff.push("question.answers");
                        a.display = true;
                        b.display = true;
                    }
                }
                return result;
            },
            property: "questions",
            data: [
                {label: 'Label', property: 'label'},
                {label: 'CDE', property: 'question.cde.tinyId', url: '/deview/?tinyId='},
                {label: 'Unit of Measurement', property: 'question.uoms'},
                {label: 'Answer', property: 'question.answers', displayAs: 'valueMeaningName'}
            ],
            diff: []
        },
        {
            label: "Naming",
            isEqual: function (a, b) {
                return a.designation === b.designation;
            },
            sort: function (a, b) {
                return a.designation.localeCompare(b.designation);
            },
            property: "naming",
            data: [
                {label: 'Name', property: 'designation'},
                {label: 'Definition', property: 'definition'},
                {label: 'Tags', property: 'tags', array: true},
                {label: 'Context', property: 'context'}
            ]
        },
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
        }
    ];


    constructor(public compareService: CompareService) {
    }

    ngOnInit(): void {
        this.left.questions = [];
        this.flatFormQuestions(this.left, this.left.questions);
        this.right.questions = [];
        this.flatFormQuestions(this.right, this.right.questions);
        this.compareService.doCompareArray(this.left, this.right, this.compareArrayOption)
    }

    flatFormQuestions(fe, questions) {
        if (fe.formElements != undefined) {
            _.forEach(fe.formElements, e => {
                if (e.elementType && e.elementType === 'question') {
                    questions.push(_.cloneDeep(e));
                } else this.flatFormQuestions(e, questions);
            })
        }
    };
}
