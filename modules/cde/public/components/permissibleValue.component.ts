import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { NgbActiveModal, NgbModalModule, NgbModalRef, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Http } from "@angular/http";

@Component({
    selector: "cde-permissible-value",
    providers: [NgbActiveModal],
    templateUrl: "./permissibleValue.component.html",
    styles: [`
        :host > > > #inlineEditWrapper[_ngcontent-c1] {
            border-bottom: 0px;
            line-height: 0;
            margin-left: 0px;
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
    public containsKnownSystem: boolean = false;
    umlsTerms = [];
    newPermissibleValue = {};
    SOURCES = {
        "NCI Thesaurus": {source: "NCIT", termType: "PT", codes: {}, selected: false},
        "UMLS": {source: "UMLS", termType: "PT", codes: {}, selected: false},
        "LOINC": {source: "LNC", termType: "LA", codes: {}, selected: false, disabled: true},
        "SNOMEDCT US": {source: "SNOMEDCT_US", termType: "PT", codes: {}, selected: false, disabled: true}
    };

    constructor(public modalService: NgbModal,
                public http: Http,
                @Inject("isAllowedModel") public isAllowedModel,
                @Inject("Alert") private alert) {
    }

    ngOnInit(): void {
        if (this.elt.valueDomain.datatype === 'Value List' && !this.elt.valueDomain.datatypeValueList) {
            this.elt.valueDomain.datatypeValueList = {};
        }
        if (this.elt.valueDomain.datatype === 'Number' && !this.elt.valueDomain.datatypeNumber) {
            this.elt.valueDomain.datatypeNumber = {};
        }
        this.containsKnownSystem = this.elt.valueDomain.permissibleValues.filter(pv => {
                return this.SOURCES[pv.codeSystemName];
            }).length > 0;
    }

    openNewPermissibleValueModal() {
        this.modalRef = this.modalService.open(this.newPermissibleValueContent, {size: "lg"});
        this.modalRef.result.then(result => {
            this.newPermissibleValue = {};
        }, () => {
        });
    }

    setValueType(valueType) {
        if (valueType === "Value List" && !this.elt.valueDomain.datatypeText)
            this.elt.valueDomain.datatypeText = {};
        if (valueType === "Text" && !this.elt.valueDomain.datatypeText)
            this.elt.valueDomain.datatypeText = {};
        if (valueType === "Date" && !this.elt.valueDomain.datatypeDate)
            this.elt.valueDomain.datatypeDate = {};
        if (valueType === "Number" && !this.elt.valueDomain.datatypeNumber)
            this.elt.valueDomain.datatypeNumber = {};
        if (valueType === "Externally Defined" && !this.elt.valueDomain.datatypeExternallyDefined)
            this.elt.valueDomain.datatypeExternallyDefined = {};
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

    removePv(index) {
        this.elt.valueDomain.permissibleValues.splice(index, 1);
        this.elt.unsaved = true;
        /*
         $scope.stageElt($scope.elt);
         $scope.runManualValidation();
         initSrcOptions();
         */
    }

    addNewPermissibleValue() {
    }

    sortPermissibleValue() {
        this.elt.unsaved = true;
    };

    dupCodesForSameSrc(src) {
        let allPvs = this.elt.valueDomain.permissibleValues;
        let matchedPvs = allPvs.filter(pv => pv.codeSystemName === src);
        let source = this.SOURCES[src];
        if (src && source) {
            matchedPvs.forEach(pvObj => {
                pvObj.valueMeaningCode.split(":").forEach(code => {
                    if (this.SOURCES[pvObj.codeSystemName]) {
                        if (!source.codes)
                            source.codes = {};
                        if (!source.codes[code])
                            source.codes[code] = {code: "", meaning: "Retrieving..."};

                    } else this.alert.addAlert("danger", "Unknown source in pv code " + code);
                })
            });
        } else
            this.alert.addAlert("danger", "Unknown source in pv source: " + src);
    };

    lookupAsSource(src) {
        let __this = this;
        if (!this.SOURCES[src].selected) this.SOURCES[src].codes = {};
        else this.dupCodesForSameSrc(src);
        let targetSource = this.SOURCES[src].source;
        this.elt.valueDomain.permissibleValues.forEach(pv => {
            __this.SOURCES[src].codes[pv.valueMeaningCode] = {code: "", meaning: "Retrieving..."};
            let code = pv.valueMeaningCode;
            let source = this.SOURCES[pv.codeSystemName].source;
            this.http.get("/crossWalkingVocabularies/" + source + "/" + code + "/" + targetSource).map(res => res.json())
                .subscribe(res => {
                    if (res.result.length > 0)
                        res.result.forEach((r) => {
                            __this.SOURCES[src].codes[pv.valueMeaningCode] = {code: r.ui, meaning: r.name};
                        });
                    else __this.SOURCES[src].codes[pv.valueMeaningCode] = {code: "N/A", meaning: "N/A"};
                }, err => {
                })
        });
        console.log("a");
    };
}