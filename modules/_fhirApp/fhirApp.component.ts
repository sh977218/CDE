import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import async_apply from 'async/apply';
import async_forEach from 'async/forEach';
import async_memoize from 'async/memoize';
import async_parallel from 'async/parallel';
import async_series from 'async/series';
import diff from 'deep-diff';
import 'fhirclient';
import _intersectionWith from 'lodash/intersectionWith';
import _noop from 'lodash/noop';
import _uniq from 'lodash/uniq';

import { ResourceTree } from '_fhirApp/resourceTree';
import { valueSets } from '_fhirApp/valueSets';
import { getMapToFhirResource } from 'shared/elt';
import { CdeId, PermissibleValue } from 'shared/models.model';
import { iterateFeSync, iterateFe, iterateFeSyncOptions } from 'shared/form/formShared';
import {
    CdeForm, DisplayProfile, FhirApp, FormElement, FormInForm, FormQuestion
} from 'shared/form/form.model';
import {
    FhirDevice, FhirDeviceMetric, FhirDomainResource, FhirEncounter, FhirObservation, FhirObservationComponent,
    FhirOrganization, FhirPatient, FhirProcedure
} from 'shared/mapping/fhir/fhirResource.model';
import { codeSystemOut } from 'shared/mapping/fhir';
import { codingArrayPreview, valuePreview } from 'shared/mapping/fhir/fhirDatatypes';
import { FhirCodeableConcept, FhirReference } from 'shared/mapping/fhir/fhir.model';
import {
    getText, getTextFromArray, newCodeableConcept, reduce as reduceConcept
} from 'shared/mapping/fhir/datatype/fhirCodeableConcept';
import { newCoding } from 'shared/mapping/fhir/datatype/fhirCoding';
import { asRefString, parseRef } from 'shared/mapping/fhir/datatype/fhirReference';
import { typedValueToValue, valuedElementToItemType } from 'shared/mapping/fhir/from/datatypeFromItemType';
import { newEncounter } from 'shared/mapping/fhir/resource/fhirEncounter';
import { observationComponentFromForm, observationFromForm } from 'shared/mapping/fhir/resource/fhirObservation';
import { getPatientName } from 'shared/mapping/fhir/resource/fhirPatient';
import { questionValueToFhirValue } from 'shared/mapping/fhir/to/datatypeToItemType';
import { deepCopy, reduceOptionalArray } from 'shared/system/util';
import { BrowserService } from 'widget/browser.service';
import { newProcedure } from '../shared/mapping/fhir/resource/fhirProcedure';

let compareCodingId = (a, b) => a['system'] === codeSystemOut(b['source']) && a['code'] === b['id'];

function iterResourceTreeAddNode(fe: FormElement | CdeForm, cb, parent: ResourceTree) {
    let self = ResourceTree.addNode(parent, undefined, fe);
    cb(undefined, self);
    return self;
}

function getDateString(resource: FhirDomainResource, periodName = '', dateTimeName = '', instanceName = ''): string {
    if (resource[periodName]) {
        return resource[periodName].start + ' - ' + resource[periodName].end;
    } else if (resource[dateTimeName]) {
        return resource[dateTimeName];
    } else if (resource[instanceName]) {
        return resource[instanceName]; // TODO: conversion from machine format
    } else {
        return '';
    }
}
function getObservationViewCode(observation: FhirObservation): string {
    return observation.code ? codingArrayPreview(observation.code.coding) : '';
}
function getObservationViewValue(observation: FhirObservation): string {
    return valuePreview(observation);
}

class EncounterVM extends FhirEncounter {
    types: string;
    reasons: string[];
    observations: FhirObservation[];
    procedures: FhirProcedure[];
    forms?: { form: CdeForm, reference: PatientForm }[];
}

function encounterVM(encounter: FhirEncounter): EncounterVM {
    return Object.create(encounter, {
        types: {
            value: getTextFromArray(encounter.type)
        },
        reasons: {
            value: getTextFromArray(encounter.reason)
        },
        observations: {
            value: []
        },
        procedures: {
            value: []
        },
    });
}

type PatientForm = {
    form: CdeForm,
    name: string,
    observed?: number,
    percent?: number,
    tinyId: string,
    total?: number,
};

@Component({
    selector: 'cde-fhir-standalone',
    template: '<router-outlet></router-outlet>'
})
export class FhirStandaloneComponent {
}

@Component({
    selector: 'cde-fhir-form',
    styles: [`
        .info-heading {
            display: inline-block;
            font-size: large;
            font-stretch: extra-condensed;
            width: 90px;
        }

        .info-label {
            font-size: large;
            font-weight: 600;
        }

        .isSelected {
            background-color: #f5f5f5;
        }

        .addbtn {
            background-color: #61c200;
            color: white;
            margin-left: 0;
            padding: 4px 8px 2px 8px;
            vertical-align: baseline;
        }

        .spin {
            animation-duration: 1s;
            animation-name: spin;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
        }

        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
    `],
    templateUrl: './fhirApp.component.html'
})
export class FhirAppComponent {
    static readonly SCOPE = 'patient/*.*';
    BrowserService = BrowserService;
    baseUrl: string;
    elt: CdeForm;
    errorMessage: string;
    getDateString = getDateString;
    getDisplayFunc = this.getDisplay.bind(this);
    getPatientName = getPatientName;
    ioInProgress: boolean;
    lookupObservationCategories = async_memoize((code, done) => {
        this.http.get('/fhirObservationInfo?id=' + code).subscribe((r: any) => {
            done(null, r ? r.categories : undefined);
        }, done);
    });
    lookupLoincName = async_memoize((code, done) => {
        this.http.get('/umlsCuiFromSrc/' + code + '/LNC').subscribe((r: any) => {
            if (r && r.result && r.result.results.length) {
                done(null, r.result.results[0].name.split(':')[0]);
            }
        }, done);
    });
    methodLoadForm = this.loadForm.bind(this);
    newEncounter: boolean;
    newEncounterDate: string = new Date().toISOString().slice(0, 16);
    newEncounterErrorMessage: string;
    newEncounterReason: string;
    newEncounterType: string = 'Outpatient Encounter';
    newEncounterValid: boolean;
    observationCategoryMap: Map<string, string[]>;
    patient: FhirPatient;
    patientForms: PatientForm[] = [];
    patientDevices: FhirDevice[] = [];
    patientEncounters: EncounterVM[] = [];
    patientObservations: FhirObservation[] = [];
    patientOrganization: FhirOrganization;
    patientProcedures: FhirProcedure[] = [];
    saveMessage: string = null;
    selectedEncounter: EncounterVM;
    selectedProfile: DisplayProfile;
    selectedProfileName: string;
    smart: any;
    saving: boolean;
    saved: boolean;
    summary: boolean = true;

    constructor(private http: HttpClient,
                public dialog: MatDialog,
                public snackBar: MatSnackBar,
                private route: ActivatedRoute) {

        let queryParams = this.route.snapshot.queryParams;
        this.selectedProfileName = queryParams['selectedProfile'];

        this.http.get<FhirApp>('/fhirApp/' + this.route.snapshot.paramMap.get('config')).subscribe(fhirApp => {
            if (!fhirApp || !fhirApp.dataEndpointUrl || !fhirApp.clientId) {
                return;
            }
            if (queryParams['state']) {
                this.loadPatientData();
            } else if (queryParams['iss']) {
                (<any>window).FHIR.oauth2.authorize({
                    'client_id': fhirApp.clientId,
                    'redirect_uri': '/' + this.route.snapshot.paramMap.get('config'),
                    'scope': FhirAppComponent.SCOPE,
                });
            }
            this.baseUrl = fhirApp.dataEndpointUrl;
            fhirApp.forms.forEach(f => {
                this.http.get<CdeForm>('/form/' + f.tinyId).subscribe(form => {
                    CdeForm.validate(form);
                    this.patientForms.push({
                        tinyId: form.tinyId,
                        name: form.designations[0].designation,
                        form: form
                    });
                    iterateFeSync(form,
                        f => {
                            f.inForm.form.ids.push(new CdeId('NLM', f.inForm.form.tinyId));
                        },
                        undefined,
                        q => {
                            q.question.cde.ids.push(new CdeId('NLM', q.question.cde.tinyId));
                            FhirAppComponent.applyCodeMapping(fhirApp, q.question.cde.ids, 'source', 'id');
                            q.question.cde.ids.forEach(id => {
                                this.getDisplay(id.source, id.id);
                            });
                            FhirAppComponent.applyCodeMapping(fhirApp, q.question.answers, 'codeSystemName',
                                'permissibleValue');
                            FhirAppComponent.applyCodeMapping(fhirApp, q.question.cde.permissibleValues, 'codeSystemName',
                                'permissibleValue');
                        }
                    );
                });
            });
        }, err => this.errorMessage = err);
    }

    addDevice(deviceRef: FhirReference<FhirDevice | FhirDeviceMetric>, containers: Array<FhirEncounter | FhirObservation>): boolean {
        if (deviceRef.reference.indexOf('Device/') !== 0) {
            return false;
        }

        let id = deviceRef.reference.substr(7);
        let found = false;
        containers.forEach(c => {
            if (Array.isArray(c.contained)) {
                found = c.contained.some(r => {
                    if (typeof((r as FhirDomainResource).resourceType) !== 'undefined'
                        && (r as FhirDomainResource).resourceType === 'Device' && r.id === id) {
                        this.patientDevices.push(r as FhirDevice);
                        return true;
                    }
                });
            }
        });

        if (!found) {
            // TODO: query for Device
        }

        return found;
    }

    static applyCodeMapping(fhirApp, ids: (CdeId | PermissibleValue)[], systemProp: string, codeProp: string): void {
        function highestPriority(ids, index) {
            if (index > 0) {
                let temp = ids[0];
                ids[0] = ids[index];
                ids[index] = temp;
            }
        }

        ids.some((id, index, ids) => {
            if (id[systemProp] === 'LOINC') {
                highestPriority(ids, index);
                return true;
            }
        });

        fhirApp.mapping.forEach(m => {
            ids.some((id, index, ids) => {
                if ((id[systemProp] === m.cdeSystem || !id[systemProp] && !m.cdeSystem) && id[codeProp] === m.cdeCode) {
                    id[systemProp] = m.fhirSystem;
                    id[codeProp] = m.fhirCode;
                    highestPriority(ids, index);
                    return true;
                }
            });
        });
    }

    encounterAdd(encounter) {
        this.patientEncounters.push(encounterVM(encounter));
    }

    encounterSelected() {
        if (!this.selectedEncounter) {
            return;
        }
        if (!this.selectedEncounter.forms) {
            this.selectedEncounter.forms = this.patientForms.map(f => ({form: deepCopy(f.form), reference: f}));
        }
        this.updateProgress();
    }

    fhirResourcePreSave(resource: FhirDomainResource): Promise<void> {
        return new Promise<void>(resolve => {
            if (resource.resourceType === 'Observation') { // has category
                const system = codeSystemOut('LOINC');
                let categoryAble = resource as FhirObservation;
                let codes: string[] = reduceConcept(categoryAble.code,
                    (a, coding) => coding.code && system === coding.system
                        ? a.concat(coding.code)
                        : a,
                    []);
                let categories: string[] = [];
                async_forEach(codes, (code, doneOne) => {
                    this.getObservationCategory('LOINC', code, cats => {
                        if (Array.isArray(cats)) {
                            categories = categories.concat(cats);
                        }
                        doneOne();
                    });
                }, () => {
                    let s = 'http://hl7.org/fhir/observation-category';
                    let existingCodes = reduceOptionalArray(categoryAble.category,
                        (a, concept) => {
                            return a.concat(reduceConcept(concept,
                                (ac, c) => {
                                    c.code && c.system === s && ac.push(c.code);
                                    return a;
                                },
                                []));
                        },
                        []);
                    let names = valueSets.get(s).codes;
                    _uniq(categories).forEach(c => {
                        if (existingCodes.indexOf(c) === -1) {
                            if (!categoryAble.category) categoryAble.category = [];
                            categoryAble.category.push(newCodeableConcept([newCoding(s, c, undefined,
                                names.get(c))]));
                        }
                    });
                    resolve();
                });
            }
        });
    }

    // TODO: refresh before copy from server and compare again to prevent save with conflict
    async fhirResourceSave(resource: FhirDomainResource, cb) {
        await this.fhirResourcePreSave(resource);
        if (resource.id) {
            this.smart.patient.api.update({
                data: JSON.stringify(resource),
                id: resource.id,
                type: resource.resourceType
            }).then(response => {
                if (!response || !response.data) {
                    return cb('Not saved ' + resource.resourceType + ' ' + resource.id);
                }
                if (response.data.resourceType === 'Observation') {
                    this.observationsReplace(response.data);
                }
                cb(undefined, response.data);
            }, cb);
        } else {
            this.smart.patient.api.create({
                baseUrl: this.baseUrl,
                data: JSON.stringify(resource),
                type: resource.resourceType
            }).then(response => {
                if (!response || !response.data || !response.data.id) {
                    return cb(resource + ' not created.');
                }
                if (response.data.resourceType === 'Observation') {
                    this.observationsAdd(response.data);
                }
                cb(undefined, response.data);
            }, cb);
        }
    }

    getDisplay(system, code): Promise<string | undefined> {
        if (system === 'LOINC') {
            return new Promise(resolve => {
                this.lookupLoincName(code, (err, data) => resolve(err ? undefined : data));
            });
        } else {
            return Promise.resolve(undefined);
        }
    }

    getForm(tinyId, cb) {
        if (!this.selectedEncounter) {
            return this.snackBar.open('Select an encounter to open a form.', '', {duration: 2000});
        }

        cb(null, this.selectedEncounter.forms.filter(f => f.form.tinyId === tinyId)[0].form);
    }

    // cb(string[]|undefined)
    getObservationCategory(system, code, cb) {
        this.lookupObservationCategories(system + ' : ' + code, (err, categories) => cb(err ? undefined : categories));
    }

    loadPatientData() {
        (<any>window).FHIR.oauth2.ready(smart => {
            this.smart = smart;
            this.smart.patient.read().then(pt => this.patient = pt);

            this.ioInProgress = true;
            async_parallel([
                // TODO: patient selector
                // cb => {
                //     this.smart.api.search({type: 'Patient'}).then(results => {
                //         cb();
                //     });
                // },
                cb => {
                    this.smart.patient.api.fetchAll({type: 'Encounter'}).then(results => {
                        results.forEach(encounter => this.encounterAdd(encounter));
                        cb();
                    });
                },
                cb => {
                    this.smart.patient.api.fetchAll({type: 'Observation'}).then(results => {
                        results.forEach(observation => this.patientObservations.push(observation));
                        cb();
                    });
                },
                cb => {
                    this.smart.patient.api.search({type: 'Organization'}).then(results => {
                        if (results && results.data && results.data.entry && results.data.entry.length) {
                            this.patientOrganization = results.data.entry[0].resource;
                        }
                        cb();
                    });
                },
                cb => {
                    // TODO: get partial reads working, next()?
                    // this.smart.patient.api.search({type: 'Procedure'}).done(function (results) {
                    //     if (results && results.data && results.data.entry && results.data.entry.length) {
                    //         this.patientProcedures = results.data.entry.map(e => e.resource);
                    //     }
                    // });
                    this.smart.patient.api.fetchAll({type: 'Procedure'}).then(results => {
                        this.patientProcedures = results;
                        cb();
                    });
                }
            ], () => {
                this.patientEncounters.sort((a, b) => {
                    if (a.period.start > b.period.start) {
                        return 1;
                    } else if (a.period.start < b.period.start) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
                this.patientObservations.forEach(o => {
                    let e;
                    let [, id] = parseRef(o.context, 'Encounter');
                    if (id) {
                        let encounters = this.patientEncounters.filter(e => e.id === id);
                        if (encounters.length) {
                            encounters[0].observations.push(o);
                            e = encounters[0];
                        }
                    }
                    if (o.device) {
                        this.addDevice(o.device, e ? [o, e] : [o]);
                    }
                });
                this.patientProcedures.forEach(p => {
                    let [, id] = parseRef(p.context, 'Encounter');
                    if (id) {
                        let encounters = this.patientEncounters.filter(e => e.id === id);
                        if (encounters.length) {
                            encounters[0].procedures.push(p);
                        }
                    }
                    // TODO: some fields contain devices
                });
                this.ioInProgress = false;
            });
        });
    }

    loadFhirData() {
        if (!this.selectedEncounter) return;
        this.loadFhirDataToForm(this.elt);
    }

    loadFhirDataToForm(formElt) {
        // TODO: reimplement with ResourceTree
        switch (formElt.mapTo && formElt.mapTo.fhir && formElt.mapTo.fhir.resourceType) {
            case 'Procedure':
                this.loadFhirProcedureToForm(formElt);
                break;
            default:
                this.loadFhirObservationsToForm(formElt);
        }
    }

    loadFhirObservationsToForm(formElt) {
        function matchComponentObservation(f, obs, ids) {
            let matchedCodes = _intersectionWith(obs.code.coding, ids, compareCodingId);
            if (matchedCodes.length) {
                iterateFeSync(f, undefined, undefined, (q: FormQuestion) => {
                    obs.component.some(c => matchSimpleObservation(q, c));
                });
                return true;
            }
        }
        function matchSimpleObservation(q, obsOrComp) {
            let matchedCodes = _intersectionWith(obsOrComp.code.coding, q.question.cde.ids, compareCodingId);
            if (matchedCodes.length) {
                typedValueToValue(q.question, valuedElementToItemType(obsOrComp), obsOrComp);
                return true;
            }
        }

        if (this.selectedEncounter.observations.some(o => matchComponentObservation(formElt, o, formElt.ids))) {
            return;
        }
        iterateFeSyncOptions(formElt,
            (f: FormInForm, ret: any, options: any) => {
                if (this.selectedEncounter.observations.some(o => matchComponentObservation(f, o, f.inForm.form.ids))) {
                    options.skip = true; // don't look for observations inside Component Observation Forms
                }
            },
            undefined,
            (q: FormQuestion) => {
                this.selectedEncounter.observations.some(o => matchSimpleObservation(q, o));
            }
        );
    }

    loadFhirProcedureToForm(formElt) {
        // only maps if the optional code is a match
        function matchProcedureField(q, p, f) {
            let matchedCodes = _intersectionWith(p.code && p.code.coding, q.question.cde.ids, compareCodingId);
            if (matchedCodes.length) {
                q.question.answer = p[f.key];
                return true;
            }
        }

        let resourceType = getMapToFhirResource(formElt);
        if (resourceType === 'Procedure') {
            let fields = formElt.mapTo.fhir.fields;
            iterateFeSync(formElt, undefined, undefined, (q: FormQuestion) => {
                fields.forEach((f, i, fields) => {
                    if (this.selectedEncounter.procedures.some(p => matchProcedureField(q, p, f))) {
                        fields.splice(i, 1);
                    }
                });
            });
        } else if (!resourceType) {
            iterateFeSync(formElt, this.loadFhirProcedureToForm.bind(this), undefined, undefined);
        }
    }

    loadForm(err = null, elt = null) {
        if (err) {
            this.errorMessage = 'Sorry, we are unable to retrieve this element.';
            return;
        }
        this.elt = elt;
        if (!this.selectedProfileName) {
            this.selectedProfile = this.elt.displayProfiles[0];
        } else {
            let selectedProfileArray = this.elt.displayProfiles.filter(d => d.name === this.selectedProfileName);
            if (selectedProfileArray && selectedProfileArray.length > 0) this.selectedProfile = selectedProfileArray[0];
            else this.selectedProfile = null;
        }
        this.loadFhirData();
    }

    newEncounterAdd() {
        this.smart.patient.api.create({
            baseUrl: this.baseUrl,
            type: 'Encounter',
            data: JSON.stringify(newEncounter(
                this.newEncounterDate + ':00-00:00',
                'Patient/' + this.patient.id,
                this.patientOrganization ? asRefString(this.patientOrganization) : undefined
            ))
        }).then(response => {
            let encounter: FhirEncounter = response.data;
            if (encounter && encounter.resourceType === 'Encounter') this.encounterAdd(encounter);
            this.newEncounterReset();
        });
    }

    newEncounterReset() {
        this.newEncounter = false;
        this.newEncounterDate = null;
        this.newEncounterErrorMessage = null;
        this.newEncounterReason = null;
        this.newEncounterType = 'Outpatient Encounter';
        this.newEncounterValid = false;
    }

    newEncounterVerify() {
        if (!this.newEncounterType || !this.newEncounterDate) {
            this.newEncounterErrorMessage = 'Error: Type and Date are required.';
            this.newEncounterValid = false;
        } else {
            this.newEncounterErrorMessage = '';
            this.newEncounterValid = true;
        }
    }

    observationsAdd(observation: FhirObservation) {
        this.patientObservations.push(observation);
        this.selectedEncounter.observations.push(observation);
    }

    observationsReplace(observation: FhirObservation) {
        let index = this.patientObservations.findIndex(o => o.id === observation.id);
        if (index > -1) this.patientObservations[index] = observation;
        index = this.selectedEncounter.observations.findIndex(o => o.id === observation.id);
        if (index > -1) this.selectedEncounter.observations[index] = observation;
    }

    openViewEncounter(e) {
        this.selectedEncounter = e;
        this.encounterSelected();
        this.dialog.open(ViewFhirEncounterDialogComponent, {
            data: {
                observations: this.selectedEncounter.observations,
                procedures: this.selectedEncounter.procedures,
            },
            width: '700px',
        });
    }

    static questionAnswered(answer) {
        return typeof(answer) !== 'undefined' && !(Array.isArray(answer) && answer.length === 0);
    }

    submitFhir() {
        this.saving = true;
        const resourceTree = new ResourceTree(Object.getPrototypeOf(this.selectedEncounter), this.elt);
        const save = (node: ResourceTree, done: Function) => {
            if (node.resourceRemote && !node.resource.id) {
                throw new Error('Error: ResourceTree bad state');
            }
            this.fhirResourceSave(node.resource, (err, resource) => {
                if (!err) {
                    ResourceTree.setResource(node, resource);
                }
                done(err);
            });
        };
        const saveTree = (node: ResourceTree, cb: Function) => {
            // identify changed
            // save Device then Observation
            async_series([
                (done) => {
                    if (node.resourceType && node.resource && (node.resourceRemote === null || node.resourceRemote
                        && diff(node.resourceRemote, node.resource))) {
                        let changes = diff(node.resourceRemote, node.resource);
                        if (node.resource.device && node.resource.device.indexOf('Device/new') > -1) {
                            // let device = devices[parseInt(p.after.device.slice(10))];
                            let device;
                            this.smart.patient.api.create({
                                baseUrl: this.baseUrl,
                                data: JSON.stringify(device),
                                type: device.resourceType
                            }).then(response => {
                                if (!response || !response.data || !response.data.id) {
                                    return done('Device not created.');
                                }
                                node.resource.device = asRefString(response.data);
                                save(node, done);
                            }, done);
                        } else {
                            save(node, done);
                        }
                    } else {
                        done();
                    }
                },
                async_apply(async_forEach, node.children, saveTree)
            ], cb);

        };
        const saveCb = () => {
            saveTree(resourceTree, (err: string) => {
                if (err) this.saveMessage = err;
                else this.saved = true;
                setTimeout(() => this.saved = false, 5000);
                this.saving = false;
                this.loadFhirData();
                this.updateProgress();
            });
        };

        let informAddNode = async (f: FormInForm, cb, parent) => {
            if (parent.resource instanceof Promise) {
                await parent.resource;
            }
            let self = iterResourceTreeAddNode(f, _noop, parent);
            if (parent.resourceType === 'Encounter' && self.resourceType === 'Observation') {
                if (!self.resource) {
                    let foundObs = this.selectedEncounter.observations.some(o => {
                        let matchedCodes = _intersectionWith(o.code.coding, f.inForm.form.ids, compareCodingId);
                        if (matchedCodes.length) {
                            ResourceTree.setResource(self, o);
                            return true;
                        }
                    });
                }
            } else if (parent.resourceType === 'Encounter' && self.resourceType === 'Procedure') {
                if (!self.resource) {
                    let foundObs = this.selectedEncounter.procedures.some(p => {
                        let matchedCodes = _intersectionWith(p.code.coding, f.inForm.form.ids, compareCodingId);
                        if (matchedCodes.length) {
                            ResourceTree.setResource(self, p);
                            return true;
                        }
                    });
                }
            }
            cb(undefined, self);
        };
        iterateFe(this.elt, informAddNode, iterResourceTreeAddNode, async (q: FormQuestion, cb, parent) => {
            if (parent.resource instanceof Promise) {
                await parent.resource;
            }
            let self = iterResourceTreeAddNode(q, _noop, parent);
            if (parent.resourceType === 'Encounter' && self.resourceType === 'Observation') {
                if (self.resource) {
                    if (self.resource instanceof Promise) {
                        self.resource = await self.resource;
                    }
                    questionValueToFhirValue(q, self.resource, true);
                } else {
                    let foundObs = this.selectedEncounter.observations.some(o => {
                        let matchedCodes = _intersectionWith(o.code.coding, q.question.cde.ids, compareCodingId);
                        if (matchedCodes.length) {
                            ResourceTree.setResource(self, o);
                            questionValueToFhirValue(q, self.resource, true);
                            return true;
                        }
                    });
                    if (!foundObs && FhirAppComponent.questionAnswered(q.question.answer)) {
                        let observationPromise = observationFromForm(q, this.getDisplayFunc, this.selectedEncounter,
                            this.patient);
                        ResourceTree.setResource(self, null, observationPromise);
                        let observation = await observationPromise;
                        ResourceTree.setResource(self, null, observation);
                        questionValueToFhirValue(q, self.resource, true);
                    }
                }
            } else if (parent.resourceType === 'Observation' && self.parentAttribute === 'component') {
                if (self.resource) {
                    if (self.resource instanceof Promise) {
                        self.resource = await self.resource;
                    }
                    questionValueToFhirValue(q, self.resource, true);
                } else {
                    if (!parent.resource) {
                        let observationPromise = observationFromForm(parent.crossReference, this.getDisplayFunc,
                            this.selectedEncounter, this.patient);
                        ResourceTree.setResource(parent, null, observationPromise);
                        let observation = await observationPromise;
                        ResourceTree.setResource(parent, null, observation);
                    }
                    if (!Array.isArray(parent.resource.component)) parent.resource.component = [];
                    let found: FhirObservationComponent;
                    parent.resource.component.some(c => {
                        let matchedCodes = _intersectionWith(c.code.coding, q.question.cde.ids, compareCodingId);
                        if (matchedCodes.length) {
                            found = c;
                            return true;
                        }
                    });
                    if (!found && FhirAppComponent.questionAnswered(q.question.answer)) {
                        let componentPromise = observationComponentFromForm(q, this.getDisplayFunc);
                        ResourceTree.setResourceNonFhir(self, componentPromise, 'component');
                        found = await componentPromise;
                        parent.resource.component.push(found);
                    }
                    ResourceTree.setResourceNonFhir(self, found, 'component');
                    questionValueToFhirValue(q, self.resource, true);
                    if (parent.resource.component.length === 0) parent.resource.component = undefined;
                }
            } else if (parent.resourceType === 'Procedure' && self.parentAttribute) {
                if (self.resource) {
                    if (self.resource instanceof Promise) {
                        self.resource = await self.resource;
                    }
                    // questionValueToFhirValue(q, self.resource, true);
                } else {
                    if (!parent.resource) {
                        let procedure = newProcedure(this.selectedEncounter, this.patient);
                        ResourceTree.setResource(parent, null, procedure);
                    }
                    switch (self.parentAttribute) {
                        case 'code':
                            if (!Array.isArray(parent.resource.code)) parent.resource.code = [];
                            let found: FhirCodeableConcept;
                            parent.resource.code.some(c => {
                                let matchedCodes = _intersectionWith(c.code.coding, q.question.cde.ids, compareCodingId);
                                if (matchedCodes.length) {
                                    found = c;
                                    return true;
                                }
                            });
                            if (!found && FhirAppComponent.questionAnswered(q.question.answer)) {
                                found = q.question.answer;
                                parent.resource.component.push(found);
                            }
                            ResourceTree.setResourceNonFhir(self, found, 'code');
                            questionValueToFhirValue(q, self.resource, true);
                            if (parent.resource.component.length === 0) parent.resource.component = undefined;
                            break;
                        case 'category':
                            if (!Array.isArray(parent.resource.category)) parent.resource.category = [];
                            // parent.resource.category find then set
                            if (parent.resource.component.length === 0) parent.resource.component = undefined;
                            break;
                        case 'bodysite':
                            break;
                        case 'note':
                            break;
                        default:
                    }
                }
            } else {
                throw new Error('Error: not supported FHIR relationship: parent ' + parent.resourceType
                    + ', child ' + self.resourceType + '.');
            }
            cb(undefined, self);
        }, saveCb, resourceTree);
    }

    updateProgress() {
        this.patientForms.forEach(f => {
            this.getForm(f.tinyId, (err, form) => {
                this.loadFhirDataToForm(form);
                f.observed = 0;
                f.total = 0;
                f.percent = 0;
                iterateFeSync(form, undefined, undefined, q => {
                    f.total++;
                    if (FhirAppComponent.questionAnswered(q.question.answer)) {
                        f.observed++;
                    }
                });
                f.percent = 100 * f.observed / f.total;
            });

        });
    }
}

@Component({
    selector: 'nih-view-fhir-obs',
    template: `
        <div mat-dialog-content>
            <table class="table">
                <thead>
                <tr>
                    <th>Observation</th>
                    <th>Value</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody>
                <tr *ngFor="let o of data.observations">
                    <td>{{getObservationViewCode(o)}}</td>
                    <td>
                        <pre>{{getObservationViewValue(o)}}</pre>
                    </td>
                    <td>{{getDateString(o, 'effectivePeriod', 'effectiveDateTime')}}</td>
                </tr>
                </tbody>
            </table>
            <table class="table">
                <thead>
                <tr>
                    <th>Category</th>
                    <th>Code</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody>
                <tr *ngFor="let p of data.procedures">
                    <td>{{getText(p.category)}}</td>
                    <td>{{getText(p.code)}}</td>
                    <td>{{getTextFromArray(p.reasonCode)}}</td>
                    <td>{{p.status}}</td>
                    <td>{{getDateString(p, 'performedPeriod', 'performedDateTime')}}</td>
                </tr>
                </tbody>
            </table>
        </div>
        <div mat-dialog-actions>
            <button mat-raised-button color="basic" mat-dialog-close cdkFocusInitial>Close</button>
        </div>
    `,
})
export class ViewFhirEncounterDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    }
    getDateString = getDateString;
    getObservationViewCode = getObservationViewCode;
    getObservationViewValue = getObservationViewValue;
    getText = getText;
    getTextFromArray = getTextFromArray;
}

