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
        "NCI Thesaurus": {termType: "PT", codes: {}, selected: false},
        "UMLS": {termType: "PT", codes: {}, selected: false},
        "LOINC": {termType: "LA", codes: {}, selected: false, disabled: true},
        "SNOMEDCT US": {termType: "PT", codes: {}, selected: false, disabled: true}
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
                            source.codes[code] = "Retrieving...";

                    } else this.alert.addAlert("danger", "Unknown source in pv code " + code);
                })
            });
        } else
            this.alert.addAlert("danger", "Unknown source in pv source: " + src);
    };

    umlsFromOther(code, system) {
        this.http.get("/umlsCuiFromSrc/" + code + "/" + system).map(res => res.json())
            .subscribe(res => {
                console.log("umls response of " + code + " :");
                console.log(res.toString());
                let cuis = [];
                return res.result.results.forEach(function (result) {
                    cuis.push({
                        valueMeaningName: result.name,
                        valueMeaningCode: result.ui
                    });
                }, err => {
                    this.SOURCES.UMLS.codes[code] = "Error retrieving";
                });
            });
    }

    umlsLookup() {
        let codes = this.SOURCES.UMLS.codes;
        for (let code in codes) {
            let funcArray = [];
            code.split(":").forEach((pvCode, i) => {
                this.umlsFromOther(pvCode, "UMLS");
            });
        }
    };

    lookupAsSource(src) {
        if (!this.SOURCES[src].selected) this.SOURCES[src].codes = {};
        else this.dupCodesForSameSrc(src);
        if (src === 'UMLS') this.umlsLookup();
        else {

        }
        console.log("a");
        /*
         $timeout(function () {

         else {
         this.elt.valueDomain.permissibleValues.forEach(function (pv) {
         if (pv.codeSystemName === "UMLS" || (displayAs[pv.codeSystemName] && src !== displayAs[pv.codeSystemName])) {
         var newCodes = [];
         pv[src] = {
         valueMeaningName: "Retrieving...",
         valueMeaningCode: "Retrieving..."
         };
         //var todo = pv.valueMeaningCode.split(":").length;
         var funcArray = [];
         pv.valueMeaningCode.split(":").forEach(function (pvCode, i) {
         var def = $q.defer();

         if (pv.codeSystemName !== "UMLS") {
         umlsFromOther(pvCode, displayAs[pv.codeSystemName], function (err, cuis) {
         var resolve = cuis[0] ? cuis[0].valueMeaningCode : "Not Found";
         def.resolve(resolve);
         });
         } else {
         def.resolve(pvCode);
         }
         def.promise.then(function (newCode) {
         if (newCode === "Not Found") {
         pv[src] = {
         valueMeaningName: "N/A",
         valueMeaningCode: "N/A"
         };
         } else {
         funcArray[i] = $q.defer();
         $http.get("/umlsAtomsBridge/" + newCode + "/" + src).then(function onSuccess(response) {
         funcArray[i].resolve(response.data);
         });
         $q.all(funcArray.map(function (d) {
         return d.promise;
         })).then(function (arrOfResponses) {
         arrOfResponses.forEach(function (response, i) {
         var termFound = false;
         if (response.result) {
         response.result.forEach(function (atom) {
         if (!termFound && atom.termType === $scope.srcOptions[src].termType) {
         var srcConceptArr = atom.sourceConcept.split('/');
         var code = srcConceptArr[srcConceptArr.length - 1];
         newCodes[i] = {
         valueMeaningName: atom.name,
         valueMeaningCode: code
         };
         termFound = true;
         }
         });
         if (!termFound) {
         newCodes[i] = {
         valueMeaningName: "N/A",
         valueMeaningCode: "N/A"
         };
         }
         } else {
         newCodes[i] = {
         valueMeaningName: "N/A",
         valueMeaningCode: "N/A"
         };
         }
         });
         pv[src] = {
         valueMeaningCode: newCodes.map(function (a) {
         return a.valueMeaningCode;
         }).join(":"),
         valueMeaningName: newCodes.map(function (a) {
         return a.valueMeaningName;
         }).join(":")
         };
         });
         }
         });
         });
         }
         });
         }
         }, 0);*/
    }
    ;
}