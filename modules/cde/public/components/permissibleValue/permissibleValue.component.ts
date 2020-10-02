import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { Dictionary } from 'async';
import { empty, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { DataElement, DATA_TYPE_ARRAY, ValueDomainValueList, ValueDomain } from 'shared/de/dataElement.model';
import { fixDataElement, fixDatatype } from 'shared/de/dataElement.model';
import { PermissibleValue } from 'shared/models.model';
import { SearchSettings } from 'shared/search/search.model';

interface Source {
    source: string;
    termType: 'PT' | 'LA';
    codes: Dictionary<{ code: string, meaning: string }>;
    selected: boolean;
    disabled: boolean;
}

interface UmlsTerm {
    name?: string;
    ui?: string;
}

interface VsacValue {
    code: string;
    codeSystemName: string;
    codeSystemVersion: string;
    displayName: string;
    isValid: boolean;
}

@Component({
    selector: 'cde-permissible-value',
    templateUrl: 'permissibleValue.component.html',
    styles: [`
        #pvTable {
            overflow: auto;
            width: 100%;
            max-height: 500px;
        }
    `]
})
export class PermissibleValueComponent {
    @Input() canEdit!: boolean;

    @Input() set elt(v: DataElement) {
        this._elt = v;
        fixDataElement(this.elt);
        if (this.userService.loggedIn()) {
            this.loadValueSet();
        }
        this.initSrcOptions();
        if (!this.elt.dataElementConcept) {
            this.elt.dataElementConcept = {};
        }
        if (!this.elt.dataElementConcept.conceptualDomain) {
            this.elt.dataElementConcept.conceptualDomain = {vsac: {}};
        }

        this.searchTerms.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => term
                ? this.http.get('/server/uts/searchUmls?searchTerm=' + term).pipe(
                    catchError(() => empty())
                )
                : empty()
            )
        ).subscribe((res: any) => {
            if (res.result && res.result.results) {
                this.umlsTerms = res.result.results;
            } else {
                this.umlsTerms = [];
            }
        });
    }

    get elt(): DataElement {
        return this._elt;
    }

    _elt!: DataElement;
    @Output() eltChange = new EventEmitter();
    @ViewChild('newPermissibleValueContent', {static: true}) public newPermissibleValueContent!: TemplateRef<any>;
    @ViewChild('importPermissibleValueContent', {static: true}) public importPermissibleValueContent!: TemplateRef<any>;
    readonly dataTypeArray = DATA_TYPE_ARRAY;
    containsKnownSystem = false;
    editMode = false;
    keys = Object.keys;
    newPermissibleValue: any = {};
    modalRef!: MatDialogRef<TemplateRef<any>>;
    searchSettings: SearchSettings = {
        classification: [],
        classificationAlt: [],
        datatypes: ['Value List'],
        excludeOrgs: [],
        excludeAllOrgs: false,
        meshTree: '',
        regStatuses: [],
        resultPerPage: 20
    };
    private searchTerms = new Subject<string>();
    vsacValueSet: VsacValue[] = [];
    umlsTerms: UmlsTerm[] = [];
    readonly SOURCES: Dictionary<Source> = {
        'NCI Thesaurus': {source: 'NCI', termType: 'PT', codes: {}, selected: false, disabled: false},
        UMLS: {source: 'UMLS', termType: 'PT', codes: {}, selected: false, disabled: false},
        LOINC: {source: 'LNC', termType: 'LA', codes: {}, selected: false, disabled: true},
        'SNOMEDCT US': {source: 'SNOMEDCT_US', termType: 'PT', codes: {}, selected: false, disabled: true}
    };

    oid$: Subject<string> = new Subject<string>();

    constructor(public http: HttpClient,
                private dialog: MatDialog,
                public userService: UserService,
                private alert: AlertService) {
        this.oid$.pipe(
            debounceTime(1000),
            distinctUntilChanged(),
        )
            .subscribe(() => {
                this.eltChange.emit();
            });
    }

    onOidChanged(event: string) {
        this.oid$.next(event);
    }

    addAllVsac() {
        this.removeSourceSelection();
        this.vsacValueSet.forEach(v => this.addVsacValue(v, false));
        this.eltChange.emit();
    }

    addNewPermissibleValue() {
        this.removeSourceSelection();
        (this.elt.valueDomain as ValueDomainValueList).permissibleValues.push(this.newPermissibleValue);
        this.modalRef.close();
        this.runManualValidation();
        this.initSrcOptions();
        this.eltChange.emit();
    }

    allVsacMatch() {
        let allVsacMatch = true;
        this.vsacValueSet.forEach(v => allVsacMatch = allVsacMatch && v.isValid);
        return allVsacMatch;
    }

    addVsacValue(vsacValue: VsacValue, emit = true) {
        if (this.isVsInPv(vsacValue)) {
            return;
        } else {
            (this.elt.valueDomain as ValueDomainValueList).permissibleValues.push({
                permissibleValue: vsacValue.displayName,
                valueMeaningName: vsacValue.displayName,
                valueMeaningCode: vsacValue.code,
                codeSystemName: vsacValue.codeSystemName,
                codeSystemVersion: vsacValue.codeSystemVersion
            });
        }
        this.runManualValidation();
        if (emit) {
            this.eltChange.emit();
        }
    }

    checkVsacId() {
        this.loadValueSet();
        this.eltChange.emit();
        this.editMode = false;
    }

    dupCodesForSameSrc(src: string) {
        const matchedPvs = (this.elt.valueDomain as ValueDomainValueList).permissibleValues.filter(pv => pv.codeSystemName === src);
        const source = this.SOURCES[src];
        if (src && source) {
            matchedPvs.forEach(pvObj => {
                if (pvObj.valueMeaningCode) {
                    pvObj.valueMeaningCode.split(':').forEach(code => {
                        if (pvObj.codeSystemName && this.SOURCES[pvObj.codeSystemName]) {
                            if (!source.codes) {
                                source.codes = {};
                            }
                            if (!source.codes[code]) {
                                source.codes[code] = {code: '', meaning: 'Retrieving...'};
                            }
                        } else {
                            this.alert.addAlert('danger', 'Unknown source in pv code ' + code);
                        }
                    });
                }
            });
        } else {
            this.alert.addAlert('danger', 'Unknown source in pv source: ' + src);
        }
    }

    initSrcOptions() {
        this.containsKnownSystem = (this.elt.valueDomain.datatype === 'Value List' && this.elt.valueDomain.permissibleValues || [])
            .filter(pv => pv.codeSystemName && this.SOURCES[pv.codeSystemName]).length > 0;
    }

    isPvInVSet(pv: PermissibleValue) {
        return this.vsacValueSet.filter(vsac =>
            pv.valueMeaningCode === vsac.code &&
            pv.codeSystemName === vsac.codeSystemName &&
            pv.valueMeaningName === vsac.displayName
        ).length > 0;
    }

    isVsInPv(vs: VsacValue) {
        const pvs = (this.elt.valueDomain as ValueDomainValueList).permissibleValues;
        if (!pvs) {
            return false;
        }
        return pvs.filter(pv =>
            pv.valueMeaningCode === vs.code &&
            pv.codeSystemName === vs.codeSystemName &&
            pv.valueMeaningName === vs.displayName
        ).length > 0;
    }

    importPv(de: DataElement) {
        const vd: ValueDomain = de.valueDomain;
        if (vd && vd.datatype) {
            if (vd.datatype === 'Value List') {
                if (vd.permissibleValues.length > 0) {
                    (this.elt.valueDomain as ValueDomainValueList).permissibleValues
                        = (this.elt.valueDomain as ValueDomainValueList).permissibleValues.concat(vd.permissibleValues);
                    this.runManualValidation();
                    this.initSrcOptions();
                    this.eltChange.emit();
                    this.modalRef.close();
                } else {
                    this.alert.addAlert('danger', 'No PV found in this element.');
                }
            } else {
                this.alert.addAlert('danger', 'Only Value Lists can be imported.');
            }
        } else {
            this.alert.addAlert('danger', 'No Datatype found.');
        }
    }

    loadValueSet() {
        this.vsacValueSet = [];
        if (this.elt.dataElementConcept && this.elt.dataElementConcept.conceptualDomain && this.elt.dataElementConcept.conceptualDomain.vsac
            && this.elt.dataElementConcept.conceptualDomain.vsac.id) {
            const vsac = this.elt.dataElementConcept.conceptualDomain.vsac;
            this.http.get<any>('/server/uts/vsacBridge/' + vsac.id).subscribe(
                res => {
                    if (!res) {
                        this.alert.addAlert('danger', 'Error: No data retrieved from VSAC for ' + vsac.id);
                    } else {
                        const vsacJson: any = res['ns0:RetrieveValueSetResponse'];
                        if (vsacJson) {
                            const ns0ValueSet = vsacJson['ns0:ValueSet'][0];
                            vsac.name = ns0ValueSet.displayName;
                            vsac.version = ns0ValueSet.version;
                            const vsacConcepts = ns0ValueSet['ns0:ConceptList'][0]['ns0:Concept'];
                            for (const vsacConcept of vsacConcepts) {
                                const v: any = {
                                    code: vsacConcept.code[0],
                                    codeSystem: vsacConcept.codeSystem[0],
                                    codeSystemName: vsacConcept.codeSystemName[0],
                                    codeSystemVersion: vsacConcept.codeSystemVersion[0],
                                    displayName: vsacConcept.displayName[0],
                                };
                                this.vsacValueSet.push(v);
                            }
                            this.validateVsacWithPv();
                            this.validatePvWithVsac();
                        }
                    }
                }, error => {
                    if (error.status === 404) {
                        this.alert.addAlert('danger', 'Error: No data retrieved from VSAC for ' + vsac.id);
                    } else {
                        this.alert.addAlert('danger', 'Error querying VSAC');
                    }
                });
        }
    }

    lookupAsSource(src: string) {
        if (!this.SOURCES[src].selected) {
            this.SOURCES[src].codes = {};
        } else {
            this.dupCodesForSameSrc(src);
        }
        const targetSource = this.SOURCES[src].source;
        (this.elt.valueDomain as ValueDomainValueList).permissibleValues.forEach(async pv => {
            const code: string = pv.valueMeaningCode || '';
            let source: string = '';
            this.SOURCES[src].codes[code] = {code: '', meaning: 'Retrieving...'};
            if (pv.codeSystemName && this.SOURCES[pv.codeSystemName]) {
                source = this.SOURCES[pv.codeSystemName].source;
            }
            if (code && source) {
                if (src === 'UMLS' && source === 'UMLS') {
                    this.SOURCES[src].codes[code] = {
                        code,
                        meaning: pv.valueMeaningName || ''
                    };
                } else if (src === 'UMLS') {
                    this.http.get<any>(`/server/uts/umlsCuiFromSrc/${code}/${source}`)
                        .subscribe(res => {
                            if (res && res.result.results.length > 0) {
                                res.result.results.forEach((r: any) => {
                                    this.SOURCES[src].codes[code] = {code: r.ui, meaning: r.name};
                                });
                            } else {
                                this.SOURCES[src].codes[code] = {code: 'N/A', meaning: 'N/A'};
                            }
                        }, () => this.alert.addAlert('danger', 'Error query UMLS.'));

                } else if (source === 'UMLS') {
                    this.http.get<any>(`/server/uts/umlsAtomsBridge/${code}/${targetSource}`)
                        .subscribe(
                            res => {
                                let l = [];
                                if (res && res.result) {
                                    l = res.result.filter((r: any) => r.termType === this.SOURCES[src].termType);
                                }
                                if (l[0]) {
                                    this.SOURCES[src].codes[code] = {
                                        code: l[0].ui,
                                        meaning: l[0].name
                                    };
                                } else {
                                    this.SOURCES[src].codes[code] = {code: 'N/A', meaning: 'N/A'};
                                }
                            }, () => this.alert.addAlert('danger', 'Error query UMLS.'));
                } else {
                    const umlsResult = await this.http.get<any>(`/server/uts/umlsCuiFromSrc/${code}/${source}`).toPromise();
                    if (umlsResult.result.results.length > 0) {
                        const umlsCui = umlsResult.result.results[0].ui;
                        try {
                            const srcResult = await this.http.get<any>(`/server/uts/umlsPtSource/${umlsCui}/${targetSource}`).toPromise();
                            if (srcResult.result.length > 0) {
                                this.SOURCES[src].codes[code] = {
                                    code: srcResult.result[0].code.substr(srcResult.result[0].code.lastIndexOf('/') + 1),
                                    meaning: srcResult.result[0].name
                                };
                            }
                        } catch (e) {
                            // UMLS return html instead of status 404! :)
                        }
                    }
                    if (!this.SOURCES[src].codes[code].code) {
                        this.SOURCES[src].codes[code] = {code: 'N/A', meaning: 'N/A'};
                    }
                }
            } else {
                this.SOURCES[src].codes[code] = {code: 'N/A', meaning: 'N/A'};
            }
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
        (this.elt.valueDomain as ValueDomainValueList).permissibleValues = [];
        this.runManualValidation();
    }

    removePv(index: number) {
        (this.elt.valueDomain as ValueDomainValueList).permissibleValues.splice(index, 1);
        this.runManualValidation();
        this.initSrcOptions();
        this.eltChange.emit();
    }

    removeSourceSelection() {
        Object.keys(this.SOURCES).forEach(sourceKey => this.SOURCES[sourceKey].selected = false);
    }

    removeVSMapping() {
        if (!this.elt.dataElementConcept) {
            this.elt.dataElementConcept = {};
        }
        if (!this.elt.dataElementConcept.conceptualDomain) {
            this.elt.dataElementConcept.conceptualDomain = {};
        }
        this.elt.dataElementConcept.conceptualDomain.vsac = {};
        this.runManualValidation();
        this.initSrcOptions();
        this.eltChange.emit();
    }

    runManualValidation() {
        this.validatePvWithVsac();
        this.validateVsacWithPv();
        // this.checkPvUnicity();
    }


    selectFromUmls(term: UmlsTerm) {
        this.newPermissibleValue.valueMeaningName = term.name;
        this.newPermissibleValue.valueMeaningCode = term.ui;
        this.newPermissibleValue.codeSystemName = 'UMLS';
        if (!this.newPermissibleValue.permissibleValue) {
            this.newPermissibleValue.permissibleValue = term.name;
        }
    }

    validatePvWithVsac() {
        const pvs: PermissibleValue[] = (this.elt.valueDomain as ValueDomainValueList).permissibleValues;
        if (!pvs) {
            return;
        }
        pvs.forEach(pv => pv.isValid = this.isPvInVSet(pv));
    }

    validateVsacWithPv() {
        this.vsacValueSet.forEach(vsItem => {
            const temp = this.isVsInPv(vsItem);
            vsItem.isValid = temp;
        });
    }

    vsacMappingExists() {
        return this.elt.dataElementConcept
            && this.elt.dataElementConcept.conceptualDomain
            && this.elt.dataElementConcept.conceptualDomain.vsac
            && this.elt.dataElementConcept.conceptualDomain.vsac.name
            && this.elt.dataElementConcept.conceptualDomain.vsac.version
            && this.elt.dataElementConcept.conceptualDomain.vsac.id;
    }

    onDataTypeChange() {
        fixDatatype(this.elt.valueDomain);
        this.runManualValidation();
        this.eltChange.emit();
    }
}
