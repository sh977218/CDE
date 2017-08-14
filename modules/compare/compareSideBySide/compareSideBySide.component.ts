import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { NgbModal, NgbModalModule, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";

@Component({
    selector: "cde-compare-side-by-side",
    templateUrl: "compareSideBySide.component.html",
    styles: [`
        .fullMatch {
            background-color: rgba(223, 240, 216, .79);
            margin: 2px 0;
        }

        .partialMatch {
            margin: 2px 0;
        }

        .notMatch {
            background-color: rgba(242, 217, 217, .5);
            margin: 2px 0;
        }
    `]
})
export class CompareSideBySideComponent implements OnInit {
    @ViewChild("compareSideBySideContent") public compareSideBySideContent: NgbModalModule;
    public modalRef: NgbModalRef;
    @Input() left: any = {};
    @Input() right: any = {};
    options = [];

    constructor(public modalService: NgbModal) {
    }

    ngOnInit(): void {
        if (this.left.elementType === "form")
            this.flatFormQuestions(this.left);
        if (this.right.elementType === "form")
            this.flatFormQuestions(this.left);
    }

    flatFormQuestions(fe) {
        if (!fe.questions) fe.questions = [];
        if (fe.formElements !== undefined) {
            fe.formElements.forEach(function (e) {
                if (e.elementType && e.elementType === "question") {
                    delete e.formElements;
                    fe.questions.push(_.cloneDeep(e));
                }
                else this.flatFormQuestions(e, fe.questions);
            });
        }
    };

    openCompareSideBySideContent() {
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
                        {label: "Tags", property: "tags"}
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
                    data: []
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
                    property: "property.concepts",
                    data: []
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
                    label: "Object Class Concept",
                    property: "objectClass.concepts",
                    data: []
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
                    label: "Property Concept",
                    property: "property.concepts",
                    data: []
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
                    label: "Unit Of Measurement",
                    property: "valueDomain.uom",
                    data: [
                        {label: "", property: "data"},
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
            }
        ];
        let formOption = [
            {
                displayAs: {
                    label: "Questions",
                    property: "questions",
                    data: [
                        {label: "Label", property: "label"},
                        {label: "CDE", property: "question.cde.tinyId", url: "/deView?tinyId="},
                        {label: "Unit of Measurement", property: "question.uoms"},
                        {label: "Answer", property: "question.answers", displayAs: "valueMeaningName"}
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _.isEqual(a.question.cde.tinyId, b.question.cde.tinyId);
                },
                fullMatches: [],
                partialMatchFn: (a, b) => {
                    let diff = [];
                    if (!_.isEqual(a, b) && _.isEqual(a.question.cde.tinyId, b.question.cde.tinyId)) {
                        if (!_.isEqual(a.label, b.label)) diff.push("label");
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
        if (this.left.elementType === "cde" && this.right.elementType === "cde")
            this.options = commonOption.concat(dataElementOption);
        if (this.left.elementType === "form" && this.right.elementType === "form")
            this.options = commonOption.concat(formOption);
        let leftCopy = _.cloneDeep(this.left);
        let rightCopy = _.cloneDeep(this.right);
        this.options.forEach(option => {
            let l = _.get(leftCopy, option.displayAs.property);
            let r = _.get(rightCopy, option.displayAs.property);
            if (!l) l = [];
            if (!r) r = [];
            if (typeof l !== "object") l = [{data: l}];
            if (!Array.isArray(l)) l = [l];
            if (typeof r !== "object") r = [{data: r}];
            if (!Array.isArray(r)) r = [r];
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
        this.modalRef = this.modalService.open(this.compareSideBySideContent, {size: "lg"});
    }
}