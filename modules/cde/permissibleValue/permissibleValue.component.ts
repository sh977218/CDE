import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Dictionary } from 'async';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { DataElement, DATA_TYPE_ARRAY, ValueDomainValueList } from 'shared/de/dataElement.model';
import { fixDataElement, fixDatatype } from 'shared/de/dataElement.model';
import { PermissibleValue, PermissibleValueCodeSystem, permissibleValueCodeSystems } from 'shared/models.model';
import { mapSeries } from 'shared/promise';
import { NewPermissibleValueModalComponent } from 'cde/permissibleValue/new-permissible-value-modal/new-permissible-value-modal.component';
import { ImportPermissibleValueModalComponent } from 'cde/permissibleValue/import-permissible-value-modal/import-permissible-value-modal.component';

interface Source {
    source: string;
    termType: 'PT' | 'LA';
    codes: Dictionary<{ code: string; meaning: string }[]>;
    selected: boolean;
    disabled: boolean;
}

interface VsacValue {
    code: string;
    codeSystemName: PermissibleValueCodeSystem;
    codeSystemVersion: string;
    displayName: string;
    isValid: boolean;
}

const SOURCES: Record<PermissibleValueCodeSystem, Source> = {
    'NCI Thesaurus': {
        source: 'NCI',
        termType: 'PT',
        codes: {},
        selected: false,
        disabled: false,
    },
    UMLS: {
        source: 'UMLS',
        termType: 'PT',
        codes: {},
        selected: false,
        disabled: false,
    },
    LOINC: {
        source: 'LNC',
        termType: 'LA',
        codes: {},
        selected: false,
        disabled: true,
    },
    'SNOMEDCT US': {
        source: 'SNOMEDCT_US',
        termType: 'PT',
        codes: {},
        selected: false,
        disabled: true,
    },
};

@Component({
    selector: 'cde-permissible-value',
    templateUrl: './permissibleValue.component.html',
    styleUrls: ['./permissibleValue.component.scss'],
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
            this.elt.dataElementConcept.conceptualDomain = { vsac: {} };
        }
    }

    get elt(): DataElement {
        return this._elt;
    }

    _elt!: DataElement;
    @Output() eltChange = new EventEmitter();
    readonly dataTypeArray = DATA_TYPE_ARRAY;
    containsKnownSystem = false;
    dialogRef?: MatDialogRef<TemplateRef<any>>;
    editMode = false;
    umlsValidationResults?: string;
    umlsValidationLoading: boolean = false;
    oid$: Subject<string> = new Subject<string>();
    readonly SOURCES: Record<PermissibleValueCodeSystem, Source> = SOURCES;
    readonly SOURCES_KEYS = permissibleValueCodeSystems;
    vsacValueSet: VsacValue[] = [];

    constructor(
        public http: HttpClient,
        private dialog: MatDialog,
        public userService: UserService,
        private alert: AlertService
    ) {
        this.oid$.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(() => {
            this.eltChange.emit();
        });
    }

    onOidChanged(event: string) {
        this.oid$.next(event);
    }

    addAllVsac(vd: ValueDomainValueList) {
        this.removeSourceSelection();
        this.vsacValueSet.forEach(v => this.addVsacValue(vd, v, false));
        this.eltChange.emit();
    }

    allVsacMatch() {
        return this.vsacValueSet.every(v => v.isValid);
    }

    addVsacValue(vd: ValueDomainValueList, vsacValue: VsacValue, emit = true) {
        if (this.isVsInPv(vsacValue)) {
            return;
        }
        vd.permissibleValues.push({
            permissibleValue: vsacValue.displayName,
            valueMeaningName: vsacValue.displayName,
            valueMeaningCode: vsacValue.code,
            codeSystemName: vsacValue.codeSystemName,
            codeSystemVersion: vsacValue.codeSystemVersion,
        });
        this.runManualValidation();
        if (emit) {
            this.eltChange.emit();
        }
    }

    checkVsacId() {
        this.eltChange.emit();
        this.editMode = false;
    }

    dupCodesForSameSrc(vd: ValueDomainValueList, src: PermissibleValueCodeSystem) {
        const matchedPvs = vd.permissibleValues.filter(pv => pv.codeSystemName === src);
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
                                source.codes[code] = [
                                    {
                                        code: '',
                                        meaning: 'Retrieving...',
                                    },
                                ];
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
        this.containsKnownSystem =
            ((this.elt.valueDomain.datatype === 'Value List' && this.elt.valueDomain.permissibleValues) || []).filter(
                pv => pv.codeSystemName && this.SOURCES[pv.codeSystemName]
            ).length > 0;
    }

    isPvInVSet(pv: PermissibleValue) {
        return (
            this.vsacValueSet.filter(
                vsac =>
                    pv.valueMeaningCode === vsac.code &&
                    pv.codeSystemName === vsac.codeSystemName &&
                    pv.valueMeaningName === vsac.displayName
            ).length > 0
        );
    }

    isVsInPv(vs: VsacValue) {
        const pvs = (this.elt.valueDomain as ValueDomainValueList).permissibleValues;
        if (!pvs) {
            return false;
        }
        return (
            pvs.filter(
                pv =>
                    pv.valueMeaningCode === vs.code &&
                    pv.codeSystemName === vs.codeSystemName &&
                    pv.valueMeaningName === vs.displayName
            ).length > 0
        );
    }

    loadValueSet() {
        this.vsacValueSet = [];
        if (
            this.elt.dataElementConcept &&
            this.elt.dataElementConcept.conceptualDomain &&
            this.elt.dataElementConcept.conceptualDomain.vsac &&
            this.elt.dataElementConcept.conceptualDomain.vsac.id
        ) {
            const vsac = this.elt.dataElementConcept.conceptualDomain.vsac;
            this.http.get<VsacValueSetResponse>('/server/uts/vsacBridge/' + vsac.id).subscribe(
                res => {
                    if (!res) {
                        this.alert.addAlert('danger', 'Error: No data retrieved from VSAC for ' + vsac.id);
                        return;
                    }
                    vsac.name = res.name;
                    vsac.version = res.version;
                    for (const vsacConcept of res.concepts) {
                        this.vsacValueSet.push({
                            code: vsacConcept.code,
                            displayName: vsacConcept.displayName,
                            codeSystemName: vsacConcept.codeSystemName as PermissibleValueCodeSystem,
                            codeSystemVersion: vsacConcept.codeSystemVersion,
                            isValid: false,
                        });
                    }
                    this.validateVsacWithPv();
                    this.validatePvWithVsac();
                },
                error => {
                    if (error.status === 404) {
                        this.alert.addAlert('danger', 'Error: No data retrieved from VSAC for ' + vsac.id);
                    } else {
                        this.alert.addAlert('danger', 'Error querying VSAC');
                    }
                }
            );
        }
    }

    lookupAsSource(vd: ValueDomainValueList, src: PermissibleValueCodeSystem) {
        if (!this.SOURCES[src].selected) {
            this.SOURCES[src].codes = {};
        } else {
            this.dupCodesForSameSrc(vd, src);
        }
        const targetSource = this.SOURCES[src].source;
        mapSeries(vd.permissibleValues, async (pv, i, pvs) => {
            const code: string = pv.valueMeaningCode || '';
            let source: string = '';
            this.SOURCES[src].codes[code] = [
                {
                    code: '',
                    meaning: 'Retrieving...',
                },
            ];
            if (pv.codeSystemName && this.SOURCES[pv.codeSystemName]) {
                source = this.SOURCES[pv.codeSystemName].source;
            }
            if (code && source) {
                if (src === 'UMLS' && source === 'UMLS') {
                    this.SOURCES[src].codes[code] = [
                        {
                            code,
                            meaning: pv.valueMeaningName || '',
                        },
                    ];
                } else if (src === 'UMLS') {
                    this.http
                        .get<any>(`/server/uts/umlsCuiFromSrc/${code}/${source}`)
                        .toPromise()
                        .then(
                            res => {
                                this.SOURCES[src].codes[code] = res.result.results.map((r: any) => {
                                    return {
                                        code: r.ui,
                                        meaning: r.name,
                                    };
                                });
                            },
                            () => this.alert.addAlert('danger', 'Error query UMLS.')
                        );
                } else if (source === 'UMLS') {
                    this.http
                        .get<any>(`/server/uts/umlsAtomsBridge/${code}/${targetSource}`)
                        .toPromise()
                        .then(
                            res => {
                                this.SOURCES[src].codes[code] = res.result
                                    .filter((r: any) => r.termType === this.SOURCES[src].termType)
                                    .map((r: any) => {
                                        return {
                                            code: r.ui,
                                            meaning: r.name,
                                        };
                                    });
                            },
                            () => {
                                this.SOURCES[src].codes[code] = [
                                    {
                                        code: 'Error looking up synonyms. Please try again later.',
                                        meaning: '',
                                    },
                                ];
                                this.alert.addAlert('danger', 'Error query UMLS.');
                            }
                        );
                } else {
                    this.http
                        .get<any>(`/server/uts/umlsCuiFromSrc/${code}/${source}`)
                        .toPromise()
                        .then(
                            umlsResult => {
                                if (umlsResult?.result?.results?.length > 0) {
                                    const umlsCui = umlsResult.result.results[0].ui;
                                    this.http
                                        .get<any>(`/server/uts/umlsPtSource/${umlsCui}/${targetSource}`)
                                        .toPromise()
                                        .then(
                                            srcResult => {
                                                if (srcResult?.result.length > 0) {
                                                    const sortedResult = srcResult.result.sort((a: any, b: any) =>
                                                        a.name.localeCompare(b.name)
                                                    );
                                                    this.SOURCES[src].codes[code] = sortedResult.map((r: any) => {
                                                        return {
                                                            code: r.code.substring(r.code.lastIndexOf('/') + 1),
                                                            meaning: r.name,
                                                        };
                                                    });
                                                } else {
                                                    this.SOURCES[src].codes[code] = [
                                                        {
                                                            code: 'No code synonyms found',
                                                            meaning: 'No code synonyms found',
                                                        },
                                                    ];
                                                }
                                            },
                                            () => {
                                                this.SOURCES[src].codes[code] = [
                                                    {
                                                        code: 'Error looking up synonyms. Please try again later.',
                                                        meaning: 'Error looking up synonyms. Please try again later.',
                                                    },
                                                ];
                                            }
                                        );
                                }
                            },
                            () => {
                                this.SOURCES[src].codes[code] = [
                                    {
                                        code: 'Error looking up synonyms. Please try again later.',
                                        meaning: '',
                                    },
                                ];
                                this.alert.addAlert('danger', 'Error query UMLS.');
                            }
                        );
                }
            } else {
                this.SOURCES[src].codes[code] = [
                    {
                        code: 'No code synonyms found',
                        meaning: 'No code synonyms found',
                    },
                ];
            }
        });
    }

    removeAllPermissibleValues(vd: ValueDomainValueList) {
        vd.permissibleValues = [];
        this.runManualValidation();
    }

    removePv(vd: ValueDomainValueList, index: number) {
        vd.permissibleValues.splice(index, 1);
        this.runManualValidation();
        this.initSrcOptions();
        this.eltChange.emit();
    }

    removeSourceSelection() {
        this.SOURCES_KEYS.forEach(sourceKey => (this.SOURCES[sourceKey].selected = false));
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
    }

    validatePvWithVsac() {
        (this.elt.valueDomain as ValueDomainValueList).permissibleValues?.forEach(
            pv => (pv.isValid = this.isPvInVSet(pv))
        );
    }

    validateVsacWithPv() {
        this.vsacValueSet.forEach(vsItem => {
            vsItem.isValid = this.isVsInPv(vsItem);
        });
    }

    vsacMappingExists() {
        return (
            this.elt.dataElementConcept &&
            this.elt.dataElementConcept.conceptualDomain &&
            this.elt.dataElementConcept.conceptualDomain.vsac &&
            this.elt.dataElementConcept.conceptualDomain.vsac.name &&
            this.elt.dataElementConcept.conceptualDomain.vsac.version &&
            this.elt.dataElementConcept.conceptualDomain.vsac.id
        );
    }

    onDataTypeChange() {
        fixDatatype(this.elt.valueDomain);
        this.runManualValidation();
        this.eltChange.emit();
    }

    async validatePVAgainstUMLS(vd: ValueDomainValueList) {
        this.umlsValidationLoading = true;
        this.umlsValidationResults = await this.http
            .post('/server/de/umls', vd.permissibleValues, {
                responseType: 'text',
            })
            .toPromise();
        this.umlsValidationLoading = false;
    }

    openNewPermissibleValueModal(vd: ValueDomainValueList) {
        this.dialog
            .open(NewPermissibleValueModalComponent, { width: '800px' })
            .afterClosed()
            .subscribe(newPermissibleValue => {
                if (newPermissibleValue) {
                    this.addNewPermissibleValue(vd, newPermissibleValue);
                }
            });
    }

    addNewPermissibleValue(vd: ValueDomainValueList, newPermissibleValue: PermissibleValue) {
        this.removeSourceSelection();
        vd.permissibleValues.push(newPermissibleValue);
        this.runManualValidation();
        this.initSrcOptions();
        this.eltChange.emit();
    }

    openImportPermissibleValueModal(vd: ValueDomainValueList) {
        this.dialog
            .open(ImportPermissibleValueModalComponent, { width: '1000px' })
            .afterClosed()
            .subscribe(de => {
                if (de) {
                    this.importPv(vd, de);
                }
            });
    }

    importPv(vd: ValueDomainValueList, de: DataElement): void {
        const deVd = de.valueDomain;
        if (!deVd?.datatype) {
            return this.alert.addAlert('danger', 'No Datatype found.');
        }
        if (deVd.datatype !== 'Value List') {
            return this.alert.addAlert('danger', 'Only Value Lists can be imported.');
        }
        if (deVd.permissibleValues.length === 0) {
            return this.alert.addAlert('danger', 'No PV found in this element.');
        }
        vd.permissibleValues = vd.permissibleValues.concat(deVd.permissibleValues);
        this.runManualValidation();
        this.initSrcOptions();
        this.eltChange.emit();
        this.alert.addAlert('success', 'Permissible Values imported');
    }
}
