import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { SearchSettings } from 'search/search.model';
import { DataElement, DataTypeArray } from 'shared/de/dataElement.model';
import { fixDatatype } from 'shared/de/deValidator';

@Component({
    selector: 'cde-permissible-value',
    templateUrl: 'permissibleValue.component.html'
})
export class PermissibleValueComponent {
    @Input() canEdit;
    _elt: DataElement;
    @Input() set elt(v: DataElement) {
        this._elt = v;
        fixDatatype(this.elt);
        if (this.userService.loggedIn()) this.loadValueSet();
        this.initSrcOptions();
        if (!this.elt.dataElementConcept.conceptualDomain) {
            this.elt.dataElementConcept.conceptualDomain = {vsac: {}};
        }

        this.searchTerms.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => term
                ? this.http.get('/searchUmls?searchTerm=' + term).pipe(
                    catchError(() => EmptyObservable.create<string[]>())
                )
                : EmptyObservable.create<string[]>()
            )
        ).subscribe((res: any) => {
            if (res.result && res.result.results) {
                this.umlsTerms = res.result.results;
            } else this.umlsTerms = [];
        });
    }
    get elt(): DataElement {
        return this._elt;
    }
    @Output() onEltChange = new EventEmitter();
    @ViewChild('newPermissibleValueContent') public newPermissibleValueContent: TemplateRef<any>;
    @ViewChild('importPermissibleValueContent') public importPermissibleValueContent: TemplateRef<any>;
    readonly DataTypeArray = DataTypeArray;
    canLinkPv = false;
    containsKnownSystem: boolean = false;
    editMode;
    keys = Object.keys;
    newPermissibleValue: any = {};
    modalRef: MatDialogRef<TemplateRef<any>>;
    pVTypeheadVsacNameList;
    searchSettings: SearchSettings = {
        classification: [],
        classificationAlt: [],
        datatypes: ['Value List'],
        excludeOrgs: [],
        excludeAllOrgs: false,
        meshTree: '',
        regStatuses: [],
        resultPerPage: 20,
    };
    private searchTerms = new Subject<string>();
    vsacValueSet = [];
    vsac = {};
    umlsTerms = [];
    SOURCES = {
        'NCI Thesaurus': {source: 'NCI', termType: 'PT', codes: {}, selected: false, disabled: false},
        UMLS: {source: 'UMLS', termType: 'PT', codes: {}, selected: false, disabled: false},
        LOINC: {source: 'LNC', termType: 'LA', codes: {}, selected: false, disabled: true},
        'SNOMEDCT US': {source: 'SNOMEDCT_US', termType: 'PT', codes: {}, selected: false, disabled: true}
    };

    constructor(public http: HttpClient,
                private dialog: MatDialog,
                public userService: UserService,
                private Alert: AlertService) {
    }

    addAllVsac() {
        this.removeSourceSelection();
        this.vsacValueSet.forEach(v => this.addVsacValue(v, false));
        this.onEltChange.emit();
    }

    addNewPermissibleValue() {
        this.removeSourceSelection();
        this.elt.valueDomain.permissibleValues.push(this.newPermissibleValue);
        this.modalRef.close();
        this.runManualValidation();
        this.initSrcOptions();
        this.onEltChange.emit();
    }

    allVsacMatch() {
        let allVsacMatch = true;
        this.vsacValueSet.forEach(v => allVsacMatch = allVsacMatch && v.isValid);
        return allVsacMatch;
    }

    addVsacValue(vsacValue, emit = true) {
        if (this.isVsInPv(vsacValue)) return;
        else {
            this.elt.valueDomain.permissibleValues.push({
                permissibleValue: vsacValue.displayName,
                valueMeaningName: vsacValue.displayName,
                valueMeaningCode: vsacValue.code,
                codeSystemName: vsacValue.codeSystemName,
                codeSystemVersion: vsacValue.codeSystemVersion
            });
        }
        this.runManualValidation();
        if (emit) this.onEltChange.emit();
    }

    checkVsacId() {
        this.loadValueSet();
        this.onEltChange.emit();
        this.editMode = false;
    }

    dupCodesForSameSrc(src) {
        let allPvs = this.elt.valueDomain.permissibleValues;
        let matchedPvs = allPvs.filter(pv => pv.codeSystemName === src);
        let source = this.SOURCES[src];
        if (src && source) {
            matchedPvs.forEach(pvObj => {
                pvObj.valueMeaningCode && pvObj.valueMeaningCode.split(':').forEach(code => {
                    if (this.SOURCES[pvObj.codeSystemName]) {
                        if (!source.codes) {
                            source.codes = {};
                        }
                        if (!source.codes[code]) {
                            source.codes[code] = {code: '', meaning: 'Retrieving...'};
                        }
                    } else this.Alert.addAlert('danger', 'Unknown source in pv code ' + code);
                });
            });
        } else {
            this.Alert.addAlert('danger', 'Unknown source in pv source: ' + src);
        }
    }

    initSrcOptions() {
        this.containsKnownSystem = this.elt.valueDomain.permissibleValues
            .filter(pv => this.SOURCES[pv.codeSystemName]).length > 0;
    }

    isPvInVSet(pv) {
        let temp = this.vsacValueSet.filter(vsac =>
            pv.valueMeaningCode === vsac.code &&
            pv.codeSystemName === vsac.codeSystemName &&
            pv.valueMeaningName === vsac.displayName
        );
        return temp.length > 0;
    }

    isVsInPv(vs) {
        let pvs = this.elt.valueDomain.permissibleValues;
        if (!pvs) return false;
        let temp = pvs.filter(pv =>
            pv.valueMeaningCode === vs.code &&
            pv.codeSystemName === vs.codeSystemName &&
            pv.valueMeaningName === vs.displayName
        );
        return temp.length > 0;
    }

    importPv(de) {
        let vd = de.valueDomain;
        if (vd && vd.datatype) {
            if (vd.datatype === 'Value List') {
                if (vd.permissibleValues.length > 0) {
                    this.elt.valueDomain.permissibleValues = this.elt.valueDomain.permissibleValues.concat(vd.permissibleValues);
                    this.runManualValidation();
                    this.initSrcOptions();
                    this.onEltChange.emit();
                    this.modalRef.close();
                } else this.Alert.addAlert('danger', 'No PV found in this element.');
            } else this.Alert.addAlert('danger', 'Only Value Lists can be imported.');
        } else this.Alert.addAlert('danger', 'No Datatype found.');
    }

    loadValueSet() {
        let dec = this.elt.dataElementConcept;
        this.vsacValueSet = [];
        if (dec && dec.conceptualDomain && dec.conceptualDomain.vsac && dec.conceptualDomain.vsac.id) {
            this.pVTypeheadVsacNameList = [];
            this.http.get('/vsacBridge/' + dec.conceptualDomain.vsac.id).subscribe(
                res => {
                    if (!res || !res['ns0:RetrieveValueSetResponse']) {
                        this.Alert.addAlert('danger', 'Error: No data retrieved from VSAC for ' + dec.conceptualDomain.vsac.id);
                    } else {
                        let data = res['ns0:RetrieveValueSetResponse'];
                        if (data) {
                            this.elt.dataElementConcept.conceptualDomain.vsac.name = data['ns0:ValueSet'][0]['$'].displayName;
                            this.elt.dataElementConcept.conceptualDomain.vsac.version = data['ns0:ValueSet'][0]['$'].version;
                            for (let i = 0; i < data['ns0:ValueSet'][0]['ns0:ConceptList'][0]['ns0:Concept'].length; i++) {
                                let vsac = data['ns0:ValueSet'][0]['ns0:ConceptList'][0]['ns0:Concept'][i]['$'];
                                this.vsacValueSet.push(vsac);
                                this.pVTypeheadVsacNameList.push(vsac.displayName);
                            }
                            this.validateVsacWithPv();
                            this.validatePvWithVsac();
                        }
                    }
                }, () => this.Alert.addAlert('danger', 'Error querying VSAC'));
        }
    }

    lookupAsSource(src) {
        if (!this.SOURCES[src].selected) this.SOURCES[src].codes = {};
        else this.dupCodesForSameSrc(src);
        let targetSource = this.SOURCES[src].source;
        this.elt.valueDomain.permissibleValues.forEach(pv => {
            this.SOURCES[src].codes[pv.valueMeaningCode] = {code: '', meaning: 'Retrieving...'};
            let code = pv.valueMeaningCode;
            let source;
            if (pv.codeSystemName) {
                if (this.SOURCES[pv.codeSystemName]) {
                    source = this.SOURCES[pv.codeSystemName].source;
                }
            }
            if (code && source) {
                if (src === 'UMLS' && source === 'UMLS') {
                    this.SOURCES[src].codes[pv.valueMeaningCode] = {
                        code: pv.valueMeaningCode,
                        meaning: pv.valueMeaningName
                    };
                } else if (src === 'UMLS') {
                    this.http.get<any>('/umlsCuiFromSrc/' + code + '/' + source)
                        .subscribe(
                            res => {
                                if (res.result.length > 0) {
                                    res.result.forEach((r) => {
                                        this.SOURCES[src].codes[pv.valueMeaningCode] = {code: r.ui, meaning: r.name};
                                    });
                                } else this.SOURCES[src].codes[pv.valueMeaningCode] = {code: 'N/A', meaning: 'N/A'};
                            }, () => this.Alert.addAlert('danger', "Error query UMLS."));

                } else if (source === 'UMLS') {
                    this.http.get<any>('/umlsAtomsBridge/' + code + '/' + targetSource)
                        .subscribe(
                            res => {
                                let l = [];
                                if (res && res.result) l = res.result.filter(r => r.termType === this.SOURCES[src].termType);
                                if (l[0]) {
                                    this.SOURCES[src].codes[pv.valueMeaningCode] = {
                                        code: l[0].ui,
                                        meaning: l[0].name
                                    };
                                } else this.SOURCES[src].codes[pv.valueMeaningCode] = {code: 'N/A', meaning: 'N/A'};
                            }, () => this.Alert.addAlert('danger', "Error query UMLS."));
                } else {
                    this.http.get<any>('/crossWalkingVocabularies/' + source + '/' + code + '/' + targetSource)
                        .subscribe(res => {
                            if (res.result.length > 0) {
                                res.result.forEach((r) => {
                                    this.SOURCES[src].codes[pv.valueMeaningCode] = {code: r.ui, meaning: r.name};
                                });
                            } else this.SOURCES[src].codes[pv.valueMeaningCode] = {code: 'N/A', meaning: 'N/A'};
                        }, () => {
                        });
                }
            } else this.SOURCES[src].codes[pv.valueMeaningCode] = {code: 'N/A', meaning: 'N/A'};
        });
    }

    lookupUmls() {
        this.searchTerms.next(this.newPermissibleValue.valueMeaningName);
    }

    openImportPermissibleValueModal() {
        this.modalRef = this.dialog.open(this.importPermissibleValueContent, {width: '1000px'});
    }

    openNewPermissibleValueModal() {
        this.modalRef = this.dialog.open(this.newPermissibleValueContent, {width: '800px'});
        this.modalRef.afterClosed().subscribe(() => this.newPermissibleValue = {}, () => {
        });
    }

    removeAllPermissibleValues() {
        this.elt.valueDomain.permissibleValues = [];
        this.runManualValidation();
    }

    removePv(index) {
        this.elt.valueDomain.permissibleValues.splice(index, 1);
        this.runManualValidation();
        this.initSrcOptions();
        this.onEltChange.emit();
    }

    removeSourceSelection() {
        Object.keys(this.SOURCES).forEach(sourceKey => this.SOURCES[sourceKey].selected = false);
    }

    removeVSMapping() {
        this.elt.dataElementConcept.conceptualDomain.vsac = {};
        this.runManualValidation();
        this.initSrcOptions();
        this.onEltChange.emit();
    }

    runManualValidation() {
        this.validatePvWithVsac();
        this.validateVsacWithPv();
        // this.checkPvUnicity();
    }


    selectFromUmls(term) {
        this.newPermissibleValue['valueMeaningName'] = term.name;
        this.newPermissibleValue['valueMeaningCode'] = term.ui;
        this.newPermissibleValue['codeSystemName'] = 'UMLS';
        if (!this.newPermissibleValue['permissibleValue']) {
            this.newPermissibleValue['permissibleValue'] = term.name;
        }
    }

    validatePvWithVsac() {
        let pvs = this.elt.valueDomain.permissibleValues;
        if (!pvs) return;
        pvs.forEach(pv => pv.isValid = this.isPvInVSet(pv));
    }

    validateVsacWithPv() {
        this.vsacValueSet.forEach(vsItem => vsItem.isValid = this.isVsInPv(vsItem));
    }

    vsacMappingExists() {
        return this.elt.dataElementConcept.conceptualDomain.vsac
            && this.elt.dataElementConcept.conceptualDomain.vsac.name
            && this.elt.dataElementConcept.conceptualDomain.vsac.version
            && this.elt.dataElementConcept.conceptualDomain.vsac.id;
    }

    onDataTypeChange() {
        fixDatatype(this.elt);
        this.runManualValidation();
        this.onEltChange.emit();
    }
}
