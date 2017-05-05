import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { NgbActiveModal, NgbModalModule, NgbModalRef, NgbModal } from "@ng-bootstrap/ng-bootstrap";

const SOURCE = {
    "NCI Thesaurus": {termType: "PT", selected: false},
    "UMLS": {termType: "PT", selected: false},
    "LOINC": {termType: "LA", selected: false, disabled: true},
    "SNOMEDCT US": {termType: "PT", selected: false, disabled: true}
};

@Component({
    selector: "cde-permissible-value",
    providers: [NgbActiveModal],
    templateUrl: "./permissibleValue.component.html",
    styles: [`
        :host > > > #permissibleValueDiv a {
            border-bottom: 0px;
            line-height: 0;
        }
    `]
})
export class PermissibleValueComponent implements OnInit {
    @ViewChild("newPermissibleValueContent") public newPermissibleValueContent: NgbModalModule;
    public modalRef: NgbModalRef;
    @Input() public elt: any;

    public valueTypeOptions = {
        data: [
            {field: "Value List"},
            {field: "Text"},
            {field: "Date"},
            {field: "Number"},
            {field: "Externally Defined"}
        ],
        value: "field",
        text: "field"
    };

    public dataTypeOptions = {
        data: [
            {field: "Text"},
            {field: "Date"},
            {field: "Number"},
            {field: "File"}
        ],
        value: "field",
        text: "field"
    };
    public edit = true;
    public containsKnownSystem: boolean = false;
    umlsTerms = [];
    public columns = [
        {prop: "permissibleValue"},
        {prop: "valueMeaningName"},
        {prop: "valueMeaningCode"},
        {prop: "codeSystemName"}
    ];
    newPermissibleValue = {};
    SOURCE_ARRAY = ["NCI Thesaurus", "UMLS", "LOINC", "SNOMEDCT US"];

    constructor(public modalService: NgbModal,
                @Inject("isAllowedModel") public isAllowedModel) {
    }

    ngOnInit(): void {
        if (this.elt.valueDomain.datatype === 'Value List' && !this.elt.valueDomain.datatypeValueList) {
            this.elt.valueDomain.datatypeValueList = {};
        }
        if (this.elt.valueDomain.datatype === 'Externally Defined' && !this.elt.valueDomain.datatypeExternallyDefined) {
            this.elt.valueDomain.datatypeExternallyDefined = {};
        }
        this.containsKnownSystem = this.elt.valueDomain.permissibleValues.filter(pv => {
                return this.SOURCE_ARRAY.indexOf(pv.codeSystemName) >= 0;
            }).length > 0;
    }

    openNewPermissibleValueModal() {
        this.modalRef = this.modalService.open(this.newPermissibleValueContent, {size: "lg"});
        this.modalRef.result.then(result => {
            this.newPermissibleValue = {};
        }, () => {
        });
    }


    saveValueType(value) {
        this.elt.valueDomain.datatype = value;
    }

    saveDataType(value) {
        this.elt.valueDomain.datatypeValueList.datatype = value;
    }

    lookupUmls = function () {
        this.http.get("/searchUmls?searchTerm=" + this.newPermissibleValue.valueMeaningName).map(res => res.json())
            .subscribe(res => {
                if (res.result && res.result.results)
                    this.umlsTerms = res.result.results;
            })
    };

    addNewPermissibleValue() {

    }
}