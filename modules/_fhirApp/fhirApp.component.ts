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
import { CdeId } from 'shared/models.model';
import { iterateFeSync, iterateFe } from 'shared/form/formShared';
import { CdeForm, DisplayProfile, FhirApp, FormElement, FormInForm, FormQuestion } from 'shared/form/form.model';
import {
    FhirDevice, FhirDeviceMetric, FhirDomainResource, FhirEncounter, FhirObservation, FhirObservationComponent,
    FhirOrganization, FhirPatient
} from 'shared/mapping/fhir/fhirResource.model';
import { codeSystemOut, codingArrayPreview, getRef, valuePreview } from 'shared/mapping/fhir/fhirDatatypes';
import { FhirReference } from 'shared/mapping/fhir/fhir.model';
import { getText, newCodeableConcept, reduce as reduceConcept } from 'shared/mapping/fhir/datatypes/codeableConcept';
import { newCoding } from 'shared/mapping/fhir/datatypes/coding';
import { typedValueToValue, valuedElementToItemType } from 'shared/mapping/fhir/from/datatypeFromItemType';
import { newEncounter } from 'shared/mapping/fhir/resource/encounter';
import { observationComponentFromForm, observationFromForm } from 'shared/mapping/fhir/resource/observation';
import { getPatientName } from 'shared/mapping/fhir/resource/patient';
import { questionValueToFhirValue } from 'shared/mapping/fhir/to/datatypeToItemType';
import { deepCopy, reduceOptionalArray } from 'shared/system/util';

let compareCodingId = (a, b) => a['system'] === codeSystemOut(b['source']) && a['code'] === b['id'];

function iterResourceTreeAddNode(fe: FormElement|CdeForm, cb, parent: ResourceTree) {
    let self = ResourceTree.addNode(parent, undefined, fe);
    cb(undefined, self);
    return self;
}

class EncounterVM extends FhirEncounter {
    types: string;
    reasons: string[];
    observations: ObservationVM[];
    forms?: {form: CdeForm, reference: PatientForm}[];
}
function encounterVM(encounter: FhirEncounter): EncounterVM {
    return Object.create(encounter, {
        type: {
            value: encounter.type ? encounter.type.map(getText).join(', ') : null
        },
        reason: {
            value: encounter.reason ? encounter.reason.map(getText) : null
        },
        observations: {
            value: []
        },
    });
}

class ObservationVM extends FhirObservation {
    encounter: string;
    preview: string;
    value: string;
}
function observationVM(observation: FhirObservation): ObservationVM {
    return Object.create(observation, {
        preview: {
            value: observation.code ? codingArrayPreview(observation.code.coding) : JSON.stringify(observation)
        },
        encounter: {
            value: observation.context ? observation.context.reference : undefined
        },
        value: {
            value: valuePreview(observation)
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
export class FhirStandaloneComponent {}

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
        .addbtn  {
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
            from {transform:rotate(0deg);}
            to {transform:rotate(360deg);}
        }
    `],
    templateUrl: './fhirApp.component.html'
})
export class FhirAppComponent {
    static readonly SCOPE = 'patient/*.*';
    baseUrl: string;
    elt: CdeForm;
    errorMessage: string;
    getDisplayFunc = this.getDisplay.bind(this);
    getPatientName = getPatientName;
    ioInProgress: boolean;
    lookupObservationCategories = async_memoize((code, done) => {
        this.http.get('/fhirObservationInfo?id=' + code).subscribe((r: any) => {
            done(null, r.categories);
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
    patientObservations: ObservationVM[] = [];
    patientOrganization: FhirOrganization;
    saveMessage: string = null;
    selectedEncounter: EncounterVM;
    selectedObservations: ObservationVM[] = [];
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
                    'scope':  FhirAppComponent.SCOPE,
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
                    iterateFeSync(form, undefined, undefined, q => {
                        q.question.cde.ids.forEach(id => {
                            this.getDisplay(id.source, id.id);
                        });
                        q.question.cde.ids.push(new CdeId(codeSystemOut('NLM'), q.question.cde.tinyId));
                    });
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
            // query for Device
        }

        return found;
    }

    encounterAdd(encounter) {
        this.patientEncounters.push(encounterVM(encounter));
    }

    encounterSelected() {
        this.filterObservations();
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

    filterObservations() {
        this.selectedObservations = this.selectedEncounter
            ? this.selectedEncounter.observations : this.patientObservations;
    }

    getDisplay(system, code): Promise<string|undefined> {
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
                cb => {
                    this.smart.patient.api.fetchAll({type: 'Encounter'})
                        .then(results => {
                            results.forEach(encounter => this.encounterAdd(encounter));
                            cb();
                        });
                },
                cb => {
                    this.smart.patient.api.fetchAll({type: 'Observation'})
                        .then(results => {
                            results.forEach(observation =>
                                this.patientObservations.push(observationVM(observation))
                            );
                            cb();
                        });
                },
                cb => {
                    this.smart.patient.api.search({type: 'Organization'})
                        .then(results => {
                            if (results && results.data && results.data.entry && results.data.entry.length) {
                                this.patientOrganization = results.data.entry[0].resource;
                            }
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
                    if (o.encounter && o.encounter.startsWith('Encounter/')) {
                        let id = o.encounter.substr(10);
                        let encounters = this.patientEncounters.filter(e => e.id === id);
                        if (encounters.length) {
                            encounters[0].observations.push(o);
                            e = encounters[0];
                        }
                    }
                    if (o.device) {
                        this.addDevice(o.device, [o, e]);
                    }
                });
                this.filterObservations();
                this.ioInProgress = false;
            });
        });
    }

    loadFhirData() {
        if (!this.selectedEncounter) return;
        this.loadFhirDataToForm(this.elt);
    }

    loadFhirDataToForm(formElt) {
        let searchInForms = (f: FormInForm) => {
            f.inForm.form.ids.push({source: 'NLM', id: f.inForm.form.tinyId});
            this.selectedEncounter.observations.some(o => {
                let matchedCodes = _intersectionWith(o.code.coding, f.inForm.form.ids, compareCodingId);
                if (matchedCodes.length) {
                    iterateFeSync(f, undefined, undefined, (q: FormQuestion) => {
                        q.question.cde.ids.push({source: 'NLM', id: q.question.cde.tinyId});
                        o.component.some(c => {
                            let matchedCodes = _intersectionWith(c.code.coding, q.question.cde.ids, compareCodingId);
                            if (matchedCodes.length) {
                                let qType = valuedElementToItemType(c);
                                typedValueToValue(q.question, qType, c);
                                return true;
                            }
                        });
                    });
                    return true;
                }
            });
        };
        iterateFeSync(formElt, searchInForms, undefined, (q: FormQuestion) => {
            q.question.cde.ids.push({source: 'NLM', id: q.question.cde.tinyId});
            this.selectedEncounter.observations.some(o => {
                let matchedCodes = _intersectionWith(o.code.coding, q.question.cde.ids, compareCodingId);
                if (matchedCodes.length) {
                    let qType = valuedElementToItemType(o);
                    typedValueToValue(q.question, qType, o);
                    return true;
                }
            });
        });
    }

    loadForm(err = null, elt = null) {
        if (err) return this.errorMessage = 'Sorry, we are unable to retrieve this element.';
        this.elt = elt;
        if (!this.selectedProfileName) this.selectedProfile = this.elt.displayProfiles[0];
        else {
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
                this.patientOrganization ? getRef(this.patientOrganization) : undefined
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
        let obs = observationVM(observation);
        this.patientObservations.push(obs);
        this.selectedEncounter.observations.push(obs);
    }

    observationsReplace(observation: FhirObservation) {
        let obs = observationVM(observation);
        let index = this.patientObservations.findIndex(o => o.id === observation.id);
        if (index > -1) this.patientObservations[index] = obs;
        index = this.selectedEncounter.observations.findIndex(o => o.id === observation.id);
        if (index > -1) this.selectedEncounter.observations[index] = obs;
    }

    openViewObs(e) {
        this.selectedEncounter = e;
        this.encounterSelected();
        this.dialog.open(ViewFhirObservationDialogComponent, {
            width: '700px',
            data: { selectedObservations: this.selectedObservations}
        });
    }

    static questionAnswered(answer) {
        return typeof(answer) !== 'undefined' && !(Array.isArray(answer) && answer.length === 0);
    }

    submitFhir() {
        this.saving = true;
        const resourceTree: ResourceTree = {
            children: [],
            crossReference: this.elt,
            resource: Object.getPrototypeOf(this.selectedEncounter),
            resourceType: this.selectedEncounter.resourceType
        };
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
                                node.resource.device = getRef(response.data);
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

        let informAddNode = async(f: FormInForm, cb, parent) => {
            if (parent.resource instanceof Promise) {
                await parent.resource;
            }
            let self = iterResourceTreeAddNode(f, _noop, parent);
            if (parent.resourceType === 'Encounter' && self.resourceType === 'Observation') {
                if (!self.resource) {
                    let foundObs = this.selectedEncounter.observations.some(o => {
                        let matchedCodes = _intersectionWith(o.code.coding, f.inForm.form.ids, compareCodingId);
                        if (matchedCodes.length) {
                            ResourceTree.setResource(self, Object.getPrototypeOf(o));
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
                            ResourceTree.setResource(self, Object.getPrototypeOf(o));
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
                        ResourceTree.setResource(parent, null, observationPromise );
                        let observation = await observationPromise;
                        ResourceTree.setResource(parent, null, observation );
                    }
                    if (!Array.isArray(parent.resource.component)) parent.resource.component = [];
                    let foundComponent = parent.resource.component.some(c => {
                        let matchedCodes = _intersectionWith(c.code.coding, q.question.cde.ids, compareCodingId);
                        if (matchedCodes.length) {
                            ResourceTree.setResourceNonFhir(self, c, 'component');
                            questionValueToFhirValue(q, self.resource, true);
                            return true;
                        }
                    });
                    if (!foundComponent && FhirAppComponent.questionAnswered(q.question.answer)) {
                        let componentPromise = observationComponentFromForm(q, this.getDisplayFunc);
                        ResourceTree.setResourceNonFhir(self, componentPromise, 'component');
                        let component = await componentPromise;
                        ResourceTree.setResourceNonFhir(self, component, 'component');
                        if (!Array.isArray(parent.resource.component)) parent.resource.component = [];
                        parent.resource.component.push(component);
                        questionValueToFhirValue(q, self.resource, true);
                    }
                    if (parent.resource.component.length === 0) parent.resource.component = undefined;
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
                <tr *ngFor="let o of data.selectedObservations">
                    <td>{{o.preview}}</td>
                    <td><pre>{{o.value}}</pre></td>
                    <td>{{o.issued}}</td>
                </tr>
                </tbody>
            </table>
        </div>
        <div mat-dialog-actions>
            <button mat-raised-button color="basic" mat-dialog-close cdkFocusInitial>Close</button>
        </div>
    `,
})
export class ViewFhirObservationDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}

