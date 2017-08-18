import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { NgbModal, NgbModalModule, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";
import { AlertService } from "system/public/components/alert/alert.service";
import { QuickBoardListService } from 'quickBoard/public/quickBoardList.service';
import { Observable } from "rxjs/Observable";
import { Http } from '@angular/http';

const URL_MAP = {
    "cde": "/de/",
    "form": "/form/"
};

@Component({
    selector: "cde-compare-side-by-side",
    templateUrl: "compareSideBySide.component.html",
    styles: [`
        .fullMatch {
            background-color: rgba(223, 240, 216, .79);
            margin: 2px 0;
        }

        .partialMatch {
            background-color: rgba(240, 225, 53, .79);
            margin: 2px 0;
        }

        .notMatch {
            background-color: rgba(242, 217, 217, .5);
            margin: 2px 0;
        }
    `]
})
export class CompareSideBySideComponent implements OnInit {
    ngOnInit(): void {
    }

    @ViewChild("compareSideBySideContent") public compareSideBySideContent: NgbModalModule;
    public modalRef: NgbModalRef;
    @Input() elements: any = [];
    options = [];
    leftUrl;
    rightUrl;
    left;
    right;
    canMergeForm: boolean = false;
    canMergeDataElement: boolean = false;

    constructor(private http: Http,
                public modalService: NgbModal,
                public quickBoardService: QuickBoardListService,
                private alert: AlertService,
                @Inject("isAllowedModel") public isAllowedModel) {
    }

    flatFormQuestions(fe) {
        let questions = [];
        if (fe.formElements) {
            fe.formElements.forEach(e => {
                if (e.elementType && e.elementType === "question") {
                    delete e.formElements;
                    delete e._id;
                    questions.push(_.cloneDeep(e));
                } else questions = questions.concat(this.flatFormQuestions(e));
            });
        }
        return questions;
    };

    getOptions(left, right) {
        let commonOption = [
            {
                displayAs: {
                    label: "Steward",
                    property: "stewardOrg.name",
                    data: [{label: "", property: "data"}]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: "Status",
                    property: "registrationState.registrationStatus",
                    data: [{label: "", property: "data"}]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                fullMatches: [],
                partialMatchFn: (a, b) => {
                    let diff = [];
                    return diff;
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: "Naming",
                    property: "naming",
                    data: [
                        {label: "Name", property: "designation"},
                        {label: "Definition", property: "definition"},
                        {
                            label: "Tags", property: "tags", properties: {
                            label: "Tag", property: "tag"
                        }
                        }
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a.designation, b.designation) && _.isEqual(a.definition, b.definition);
                },
                fullMatches: [],
                partialMatchFn: (a, b) => {
                    let diff = [];
                    if (!_.isEqual(a, b) && _.isEqual(a.designation, b.designation)) {
                        if (!_.isEqual(a.definition, b.definition)) diff.push("definition");
                        if (!_.isEqual(a.tags, b.tags)) diff.push("tags");
                    }
                    return diff;
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _.isEqual(a.designation, b.designation);
                },
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: "Reference Documents",
                    property: "referenceDocuments",
                    data: [
                        {label: "Title", property: "title"},
                        {label: "URL", property: "url"},
                        {label: "Document", property: "document"},
                        {label: "Provider Org", property: "providerOrg"},
                        {label: "Language Code", property: "languageCode"}
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                fullMatches: [],
                partialMatchFn: (a, b) => {
                    let diff = [];
                    if (!_.isEqual(a, b) && _.isEqual(a.title, b.title)) {
                        if (!_.isEqual(a.uri, b.uri)) diff.push("uri");
                        if (!_.isEqual(a.providerOrg, b.providerOrg)) diff.push("providerOrg");
                        if (!_.isEqual(a.languageCode, b.languageCode)) diff.push("languageCode");
                        if (!_.isEqual(a.document, b.document)) diff.push("document");
                    }
                    return diff;
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _.isEqual(a.title, b.title);
                },
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: "Properties",
                    property: "properties",
                    data: [
                        {label: "Key", property: "key"},
                        {label: "Value", property: "value"},
                        {label: "Source", property: "source"},
                        {label: "Value Format", property: "valueFormat"}
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                fullMatches: [],
                partialMatchFn: (a, b) => {
                    let diff = [];
                    if (!_.isEqual(a, b) && _.isEqual(a.key, b.key)) {
                        if (!_.isEqual(a.value, b.value)) diff.push("value");
                        if (!_.isEqual(a.valueFormat, b.valueFormat)) diff.push("valueFormat");
                    }
                    return diff;
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _.isEqual(a.key, b.key);
                },
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: "Identifier",
                    property: "ids", data: [
                        {label: "Source", property: "source"},
                        {label: "Id", property: "id"},
                        {label: "Version", property: "version"}
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                fullMatches: [],
                partialMatchFn: (a, b) => {
                    let diff = [];
                    return diff;
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _.isEqual(a.source, b.source) && _.isEqual(a.id, b.id);
                },
                leftNotMatches: [],
                rightNotMatches: []
            }
        ];
        let dataElementOption = [
            {
                displayAs: {
                    label: "Data Element Concept",
                    property: "dataElementConcept.concepts",
                    data: [
                        {label: "Name", property: "name"},
                        {label: "Origin", property: "origin"},
                        {label: "Origin Id", property: "originId"}
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: "Object Class Concept",
                    property: "objectClass.concepts",
                    data: [{label: "Name", property: "name"},
                        {label: "Origin", property: "origin"},
                        {label: "Origin Id", property: "originId"}
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: "Property Concept",
                    property: "property.concepts",
                    data: [{label: "Name", property: "name"},
                        {label: "Origin", property: "origin"},
                        {label: "Origin Id", property: "originId"}
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: "Unit of Measure",
                    property: "valueDomain.uom",
                    data: [
                        {label: "", property: "data"},
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: "Data Type",
                    property: "valueDomain.datatype",
                    data: [
                        {label: "", property: "data"},
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: "Data Type Value List",
                    property: "valueDomain.datatypeValueList",
                    data: [
                        {label: "Data Type", property: "datatype"}
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: "Permissible Values",
                    property: "valueDomain.permissibleValues",
                    data: [
                        {label: "Code Value", property: "permissibleValue"},
                        {label: "Code Name", property: "valueMeaningName"},
                        {label: "Code", property: "valueMeaningCode"},
                        {label: "Code System", property: "codeSystemName"}
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: "Data Type Number",
                    property: "valueDomain.datatypeNumber",
                    data: [
                        {label: "Minimum Value", property: "minValue"},
                        {label: "Maximum Value", property: "maxValue"},
                        {label: "Precision", property: "precision"}
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: "Data Type Text",
                    property: "valueDomain.datatypeText",
                    data: [
                        {label: "Minimum Length", property: "minLength"},
                        {label: "Maximum Length", property: "maxLength"},
                        {label: "Regular Expression", property: "regex"},
                        {label: "Rule", property: "rule"}
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: "Data Type Date",
                    property: "valueDomain.datatypeDate",
                    data: [
                        {label: "Format", property: "format"}
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: "Data Type Time",
                    property: "valueDomain.datatypeTime",
                    data: [
                        {label: "Format", property: "format"}
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: "Data Type Externally Defined",
                    property: "valueDomain.datatypeExternallyDefined",
                    data: [
                        {label: "Link", property: "link"},
                        {label: "Description", property: "description"},
                        {label: "Description Format", property: "descriptionFormat"}
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                leftNotMatches: [],
                rightNotMatches: []
            }
        ];
        let formOption = [
            {
                displayAs: {
                    label: "Questions",
                    property: "questions",
                    data: [
                        {label: "Label", property: "label"},
                        {label: "Data Type", property: "question.datatype"},
                        {label: "CDE", property: "question.cde.tinyId", url: "/deView?tinyId="},
                        {label: "Unit of Measure", property: "question.uoms"},
                        {
                            label: "Answer", property: "question.answers", properties: {
                            label: "Permissible Value", property: "permissibleValue"
                        }
                        }
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a, b);
                },
                fullMatches: [],
                partialMatchFn: (a, b) => {
                    let diff = [];
                    if (!_.isEqual(a, b) && _.isEqual(a.question.cde.tinyId, b.question.cde.tinyId)) {
                        if (!_.isEqual(a.label, b.label)) diff.push("label");
                        if (!_.isEqual(a.question.datatype, b.question.datatype)) diff.push("question.datatype");
                        if (!_.isEqual(a.question.uoms, b.question.uoms)) diff.push("question.uoms");
                        if (!_.isEqual(a.question.answers, b.question.answers)) diff.push("question.answers");
                    }
                    return diff;
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _.isEqual(a.question.cde.tinyId, b.question.cde.tinyId);
                },
                leftNotMatches: [],
                rightNotMatches: []
            }
        ];
        let isDataElement = false;
        let isForm = false;
        if (left.elementType === "cde" && right.elementType === "cde") {
            this.options = commonOption.concat(dataElementOption);
            this.leftUrl = "deView?tinyId=" + left.tinyId;
            this.rightUrl = "deView?tinyId=" + right.tinyId;
            isDataElement = true;
        }
        if (left.elementType === "form" && right.elementType === "form") {
            this.options = commonOption.concat(formOption);
            this.leftUrl = "formView?tinyId=" + left.tinyId;
            this.rightUrl = "formView?tinyId=" + right.tinyId;
            isForm = true;
        }
        this.canMergeForm = isForm && this.isAllowedModel.isAllowed(left) &&
            this.isAllowedModel.isAllowed(right);
        this.canMergeDataElement = isDataElement;
    }

    openCompareSideBySideContent() {
        let selectedDEs = this.elements.filter(d => d.checked);
        if (this.elements.length === 2)
            selectedDEs = this.elements;
        if (selectedDEs.length !== 2) {
            this.alert.addAlert("warning", "Please select only two elements to compare.");
            return;
        }
        this.doCompare(selectedDEs[0], selectedDEs[1], () => {
            this.modalRef = this.modalService.open(this.compareSideBySideContent, {size: "lg"});
        });
    };

    doCompare(l, r, cb) {
        let leftObservable = this.http.get(URL_MAP[l.elementType] + l.tinyId).map(res => res.json());
        let rightObservable = this.http.get(URL_MAP[r.elementType] + r.tinyId).map(res => res.json());
        Observable.forkJoin([leftObservable, rightObservable]).subscribe(results => {
            this.left = <any>results[0];
            this.right = <any>results[1];
            if (this.left.elementType === "form") {
                this.left.questions = this.flatFormQuestions(this.left);
            }
            if (this.right.elementType === "form") {
                this.right.questions = this.flatFormQuestions(this.right);
            }
            this.getOptions(this.left, this.right);
            this.options.forEach(option => {
                let l = _.get(this.left, option.displayAs.property);
                let r = _.get(this.right, option.displayAs.property);
                if (!l) l = [];
                if (!r) r = [];
                if (typeof l !== "object") l = [{data: l}];
                if (!_.isArray(l)) l = [l];
                if (typeof r !== "object") r = [{data: r}];
                if (!_.isArray(r)) r = [r];
                _.intersectionWith(l, r, (a, b) => {
                    if (option.fullMatchFn(a, b)) {
                        option.displayAs.display = true;
                        option.fullMatches.push({left: a, right: b});
                        return true;
                    }
                });
                _.intersectionWith(l, r, (a, b) => {
                    let partialMatchDiff = option.partialMatchFn(a, b);
                    if (partialMatchDiff.length > 0) {
                        option.displayAs.display = true;
                        option.partialMatches.push({left: a, right: b, diff: partialMatchDiff});
                        return true;
                    }
                });
                option.leftNotMatches = _.differenceWith(l, r, option.notMatchFn);
                option.rightNotMatches = _.differenceWith(r, l, option.notMatchFn);
                if (option.leftNotMatches.length > 0 || option.rightNotMatches.length > 0)
                    option.displayAs.display = true;
            });
            cb();
        }, err => this.alert.addAlert("danger", err));
    }

    getValue(o, d) {
        let value = _.get(o, d.property);
        if (!value) return;
        if (d.url) return '<a target="_blank" href="' + d.url + value + '">' + value + '</a>';
        else if (d.properties) {
            let v = value.map(v => _.get(v, d.properties.property));
            if (!_.isEmpty(v)) return d.properties.label + ": " + v;
            else return "";
        } else if (_.isArray(value))
            return JSON.stringify(value);
        else return value;
    }

    doneMerge(event) {
        this.left = event.left;
        this.right = event.right;
        this.doCompare(this.left, this.right, () => {
        });
    }
}