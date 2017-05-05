import { Component, Inject, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

const VALUE_TYPE_MAP = {
    0: "",
    1: "Value List",
    2: "Text",
    3: "Date",
    4: "Number",
    5: "Externally Defined"
};
const TYPE_VALUE_MAP = {
    "Value List": 1,
    "Text": 2,
    "Date": 3,
    "Number": 4,
    "Externally Defined": 5
};

const SOURCE = {
    NCI: {displayAs: "NCI Thesaurus", termType: "PT", selected: false},
    UMLS: {displayAs: "UMLS", termType: "PT", selected: false},
    LNC: {displayAs: "LOINC", termType: "LA", selected: false, disabled: true},
    SNOMEDCT_US: {displayAs: "SNOMEDCT US", termType: "PT", selected: false, disabled: true}
};

const SOURCE_ARRAY = ["NCI", "UMLS", "LNC", "SNOMEDCT_US"];

@Component({
    selector: "cde-permissible-value",
    providers: [NgbActiveModal],
    templateUrl: "./permissibleValue.component.html",
    styles: [`
        :host >>> #permissibleValueDiv a { 
            border-bottom: 0px;
            line-height: 0;
         }
    `]
})
export class PermissibleValueComponent implements OnInit {
    @Input() public elt: any;
    public valueTypeOptions = [
        {value: 1, text: "Value List"},
        {value: 2, text: "Text"},
        {value: 3, text: "Date"},
        {value: 4, text: "Number"},
        {value: 5, text: "Externally Defined"}
    ];
    public edit = true;
    public valueType = 0;
    public uom;
    public containsKnownSystem: boolean = false;

    public columns = [
        {prop: "permissibleValue"},
        {prop: "valueMeaningName"},
        {prop: "valueMeaningCode"},
        {prop: "codeSystemName"}
    ];

    ngOnInit(): void {
        this.valueType = TYPE_VALUE_MAP[this.elt.valueDomain.datatype];
        this.uom = this.elt.valueDomain.uom;
    }

    constructor(@Inject("isAllowedModel") public isAllowedModel) {
    }

    saveEditable(value) {

        this.elt.valueDomain.datatype = VALUE_TYPE_MAP[value];
    }


    initSrcOptions() {
        this.containsKnownSystem = false;
        for (var i = 0; i < this.elt.valueDomain.permissibleValues.length; i++) {
            if (SOURCE[this.elt.valueDomain.permissibleValues[i].codeSystemName] ||
                this.elt.valueDomain.permissibleValues[i].codeSystemName === 'UMLS') {
                this.containsKnownSystem = true;
                i = this.elt.valueDomain.permissibleValues.length;
            }
        }
    }
}