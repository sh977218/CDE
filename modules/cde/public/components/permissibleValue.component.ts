import { Component, Inject, Input, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { NgbActiveModal, NgbModalModule, NgbModalRef, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Http } from "@angular/http";

import * as deValidator from "../../../cde/shared/deValidator";
import * as _ from "lodash";

@Component({
    selector: "cde-permissible-value",
    providers: [NgbActiveModal],
    templateUrl: "permissibleValue.component.html"
})
export class PermissibleValueComponent implements OnInit {
    @ViewChild("newPermissibleValueContent") public newPermissibleValueContent: NgbModalModule;
    public modalRef: NgbModalRef;
    @Input() public elt: any;
    showValidateButton;
    vsacValueSet = [];
    editMode;
    oid: String;
    vsac = {};
    pVTypeheadVsacNameList;

    dataTypeOptions = ["Value List", "Text", "Date", "Number", "Externally Defined"];
    dataTypeValueListOptions = ["Text", "Date", "Number"];

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
        this.fixDatatype();
        this.elt.allValid = true;
        this.containsKnownSystem = this.elt.valueDomain.permissibleValues.filter(pv => {
                return this.SOURCES[pv.codeSystemName];
            }).length > 0;
    }

    fixDatatype() {
        if (this.elt.valueDomain.datatype === "Value List" && !this.elt.valueDomain.datatypeValueList)
            this.elt.valueDomain.datatypeValueList = {};
        if (this.elt.valueDomain.datatype === "Number" && !this.elt.valueDomain.datatypeNumber)
            this.elt.valueDomain.datatypeNumber = {};
        if (this.elt.valueDomain.datatype === "Text" && !this.elt.valueDomain.datatypeText)
            this.elt.valueDomain.datatypeText = {};
        if (this.elt.valueDomain.datatype === "Date" && !this.elt.valueDomain.datatypeDate)
            this.elt.valueDomain.datatypeDate = {};
        if (this.elt.valueDomain.datatype === "Externally Defined" && !this.elt.valueDomain.datatypeExternallyDefined)
            this.elt.valueDomain.datatypeExternallyDefined = {};
    }


    openNewPermissibleValueModal() {
        this.modalRef = this.modalService.open(this.newPermissibleValueContent, {size: "lg"});
        this.modalRef.result.then(result => {
            this.newPermissibleValue = {};
        }, () => {
        });
    }

    lookupUmls = function () {
        this.http.get("/searchUmls?searchTerm=" + this.newPermissibleValue.valueMeaningName).map(res => res.json())
            .subscribe(res => {
                if (res.result && res.result.results)
                    this.umlsTerms = res.result.results;
                else this.umlsTerms = [];
            });
    };

    removePv(index) {
        this.elt.valueDomain.permissibleValues.splice(index, 1);
        this.validatePvWithVsac();
        this.validateVsacWithPv();
        this.checkPvUnicity();
        this.elt.unsaved = true;
    }

    addNewPermissibleValue() {
        this.elt.valueDomain.permissibleValues.push(this.newPermissibleValue);
        this.modalRef.close();
        this.checkPvUnicity();
        this.stageElt();
    }

    removeAllPermissibleValues() {
        this.elt.valueDomain.permissibleValues = [];
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
                });
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
                }, err => this.alert.addAlert("danger", err));
        });
        console.log("a");
    };


    vsacMappingExists() {
        return typeof(this.elt.dataElementConcept.conceptualDomain) !== "undefined" &&
            typeof(this.elt.dataElementConcept.conceptualDomain.vsac) !== "undefined";
    };

    removeVSMapping = function () {
        delete this.elt.dataElementConcept.conceptualDomain.vsac;
    };

    isVsInPv = function (vs) {
        let pvs = this.elt.valueDomain.permissibleValues;
        if (!pvs) return false;
        let temp = pvs.filter(pv =>
            pv.valueMeaningCode === vs.code &&
            pv.codeSystemName === vs.codeSystemName &&
            pv.valueMeaningName === vs.displayName
        );
        return temp.length > 0;
    };

    isPvInVSet(pv) {
        let temp = this.vsacValueSet.filter(vsac =>
            pv.valueMeaningCode === vsac.code &&
            pv.codeSystemName === vsac.codeSystemName &&
            pv.valueMeaningName === vsac.displayName
        );
        return temp.length > 0;
    };

    validatePvWithVsac() {
        let pvs = this.elt.valueDomain.permissibleValues;
        if (!pvs) {
            return;
        }
        pvs.forEach(pv => {
            pv.isValid = this.isPvInVSet(pv);
        });
    };

    checkPvUnicity() {
        let validObject = deValidator.checkPvUnicity(this.elt.valueDomain);
        this.elt.allValid = validObject["allValid"];
        this.elt.pvNotValidMsg = validObject["pvNotValidMsg"];
    };

    validateVsacWithPv() {
        this.vsacValueSet.forEach(vsItem => {
            vsItem.isValid = this.isVsInPv(vsItem);
        });
    };

    addVsacValue(vsacValue) {
        if (this.isVsInPv(vsacValue)) return;
        else this.elt.valueDomain.permissibleValues.push({
            "permissibleValue": vsacValue.displayName,
            "valueMeaningName": vsacValue.displayName,
            "valueMeaningCode": vsacValue.code,
            "codeSystemName": vsacValue.codeSystemName,
            "codeSystemVersion": vsacValue.codeSystemVersion
        });
    };

    loadValueSet() {
        let dec = this.elt.dataElementConcept;
        if (dec && this.oid) {
            this.vsacValueSet = [];
            this.pVTypeheadVsacNameList = [];
            this.http.get("/vsacBridge/" + this.oid).map(res => res.json()).subscribe(
                res => {
                    let data = res["ns0:RetrieveValueSetResponse"];
                    if (data) {
                        for (let i = 0; i < data["ns0:ValueSet"][0]["ns0:ConceptList"][0]["ns0:Concept"].length; i++) {
                            let vsac = data["ns0:ValueSet"][0]["ns0:ConceptList"][0]["ns0:Concept"][i]["$"];
                            this.vsacValueSet.push(vsac);
                            this.pVTypeheadVsacNameList.push(vsac.displayName);
                        }
                        this.validateVsacWithPv();
                    } else this.alert.addAlert("danger", "Error: No data retrieved from VSAC.");
                },
                err => {
                    console.log("err");
                    this.alert.addAlert("danger", "Error querying VSAC");
                });
        }
    };

    checkVsacId() {
        this.loadValueSet();
        this.elt.unsaved = true;
        this.editMode = false;
    };

    selectFromUmls(term) {
        this.newPermissibleValue["valueMeaningName"] = term.name;
        this.newPermissibleValue["valueMeaningCode"] = term.ui;
        this.newPermissibleValue["codeSystemName"] = "UMLS";
        if (!this.newPermissibleValue["permissibleValue"]) {
            this.newPermissibleValue["permissibleValue"] = term.name;
        }
    };

    stageElt(event = null) {
        this.elt.unsaved = true;
    }
}