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

@Component({
    selector: "cde-permissible-value",
    providers: [NgbActiveModal],
    templateUrl: "./permissibleValue.component.html",
    styles: [`a[_ngcontent-kng-20] { border-bottom: 0px;  line-height: 0;}`]
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
    public value = 0;

    public columns = [
        {prop: "permissibleValue"},
        {prop: "valueMeaningName"},
        {prop: "valueMeaningCode"},
        {prop: "codeSystemName"}
    ];

    ngOnInit(): void {
        this.value = TYPE_VALUE_MAP[this.elt.valueDomain.datatype];
    }

    constructor(@Inject("isAllowedModel") public isAllowedModel) {
    }

    saveEditable(value) {

        this.elt.valueDomain.datatype = VALUE_TYPE_MAP[value];
    }
}