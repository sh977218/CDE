import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import async_forEach from 'async/forEach';
import async_parallel from 'async/parallel';
import 'fhirclient';
import _intersectionWith from 'lodash/intersectionWith';

import { CdeId } from 'shared/models.model';
import { iterateFeSync } from 'shared/form/formShared';
import { CdeForm, DisplayProfile, FhirApp, FormQuestion } from 'shared/form/form.model';
import {
    FhirDevice, FhirDeviceMetric, FhirDomainResource, FhirEncounter, FhirObservation, FhirOrganization, FhirPatient
} from 'shared/mapping/fhir/fhirResource.model';
import { externalCodeSystemsMap } from 'shared/mapping/fhir';
import { codingArrayPreview, valuePreview } from 'shared/mapping/fhir/fhirDatatypes';
import { typedValueToValue, valuedElementToItemType } from 'shared/mapping/fhir/from/datatypeFromItemType';
import { newEncounter } from 'shared/mapping/fhir/resource/encounter';
import { observationFromForm } from 'shared/mapping/fhir/resource/observation';
import { getPatientName } from 'shared/mapping/fhir/resource/patient';
import { containerToItemType, itemTypeToItemDatatype, valueToTypedValue } from 'shared/mapping/fhir/to/datatypeToItemType';
import { capString } from 'shared/system/util';
import { FhirReference } from 'shared/mapping/fhir/fhir.model';

let compareCodingId = (a, b) => a['system'] === externalCodeSystemsMap[b['source']] && a['code'] === b['id'];

type EncounterVM = any;
function encounterVM(encounter: FhirEncounter): EncounterVM {
    return Object.create(encounter, {
        type: {
            value: encounter.type ? encounter.type.map(e => e.text).join(', ') : null
        },
        reason: {
            value: encounter.reason ? encounter.reason.map(r => r.coding.length ? r.coding[0].display : '') : null
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
    codeToDisplay: any = {};
    elt: CdeForm;
    errorMessage: string;
    ioInProgress: boolean;
    getPatientName = getPatientName;
    methodLoadForm = this.loadForm.bind(this);
    newEncounter: boolean;
    newEncounterDate: string = new Date().toISOString().slice(0, 16);
    newEncounterErrorMessage: string;
    newEncounterReason: string;
    newEncounterType: string = 'Outpatient Encounter';
    newEncounterValid: boolean;
    patient: FhirPatient;
    patientForms: {
        form: CdeForm,
        name: string,
        observed?: number,
        percent?: number,
        tinyId: string,
        total?: number,
    }[] = [];
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
                        name: form.naming[0].designation,
                        form: form
                    });
                    iterateFeSync(form, () => {}, () => {}, q => {
                        q.question.cde.ids.forEach(id => {
                            if (id.source === 'LOINC') {
                                this.http.get('/umlsCuiFromSrc/' + id.id + '/LNC').subscribe((r: any) => {
                                    if (r && r.result && r.result.results.length) {
                                        this.codeToDisplay[id.source + ':' + id.id] = r.result.results[0].name.split(':')[0];
                                    }
                                });
                            }
                        });
                        q.question.cde.ids.push(new CdeId(externalCodeSystemsMap.NLM, q.question.cde.tinyId));
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
            this.selectedEncounter.forms = this.patientForms.map(f => ({form: JSON.parse(JSON.stringify(f.form)),
                reference: f}));
        }
        this.updateProgress();
    }

    filterObservations() {
        this.selectedObservations = this.selectedEncounter
            ? this.selectedEncounter.observations : this.patientObservations;
    }

    getForm(tinyId, cb) {
        if (!this.selectedEncounter) {
            return this.snackBar.open('Select an encounter to open a form.', '', {duration: 2000});
        }

        cb(null, this.selectedEncounter.forms.filter(f => f.form.tinyId === tinyId)[0].form);
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
        iterateFeSync(formElt, undefined, undefined, (q: FormQuestion) => {
            q.question.cde.ids.push({source: 'NLM', id: q.question.cde.tinyId});
            this.selectedEncounter.observations.forEach(o => {
                let matchedCodes = _intersectionWith(o.code.coding, q.question.cde.ids, compareCodingId);
                if (matchedCodes.length) {
                    let qType = valuedElementToItemType(o);
                    typedValueToValue(q.question, qType, o);
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
                this.patientOrganization ? 'Organization/' + this.patientOrganization.id : undefined
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
        let submitFhirObservationsPending: {before: FhirObservation, after: FhirObservation}[] = [];

        iterateFeSync(this.elt, undefined, undefined, (q: FormQuestion) => {
            let observation: FhirObservation;
            let foundObs = this.selectedEncounter.observations.some(o => {
                let matchedCodes = _intersectionWith(o.code.coding, q.question.cde.ids, compareCodingId);
                if (matchedCodes.length) {
                    let original = Object.getPrototypeOf(o);
                    observation = JSON.parse(JSON.stringify(original));
                    let qType = containerToItemType(q.question);
                    observation['value' + capString(itemTypeToItemDatatype(qType, true))] = valueToTypedValue(q.question,
                        qType, q.question.answer, undefined, q.question.answerUom, true);
                    submitFhirObservationsPending.push({before: original, after: observation});
                    return true;
                }
            });
            if (!foundObs && FhirAppComponent.questionAnswered(q.question.answer)) {
                observation = observationFromForm(q, this.codeToDisplay, this.selectedEncounter, this.patient);
                let qType = containerToItemType(q.question);
                observation['value' + capString(itemTypeToItemDatatype(qType, true))] = valueToTypedValue(q.question,
                    qType, q.question.answer, undefined, q.question.answerUom, true);
                submitFhirObservationsPending.push({before: null, after: observation});
            }
        });

        // identify changed
        for (let i = 0; i < submitFhirObservationsPending.length; i++) {
            let p = submitFhirObservationsPending[i];
            if (valuePreview(p.before) === valuePreview(p.after) || (p.before ? p.before.device : undefined) !== p.after.device) {
                submitFhirObservationsPending.splice(i, 1);
                i--;
            }
        }

        // save Device then Observation
        // TODO: refresh before copy from server and compare again to prevent save with conflict
        async_forEach(submitFhirObservationsPending, (p, done) => {
            let saveObservation = (p, done) => {
                if (p.before) {
                    this.smart.api.update({
                        data: JSON.stringify(p.after),
                        id: p.after.id,
                        type: p.after.resourceType
                    }).then(response => {
                        if (!response || !response.data) return done('Not saved ' + p.after.id);
                        let obs = observationVM(response.data);
                        let index = this.patientObservations.findIndex(o => Object.getPrototypeOf(o) === p.before);
                        if (index > -1) this.patientObservations[index] = obs;
                        index = this.selectedEncounter.observations.findIndex(o => Object.getPrototypeOf(o) === p.before);
                        if (index > -1) this.selectedEncounter.observations[index] = obs;
                        done();
                    }, done);
                } else {
                    this.smart.patient.api.create({
                        baseUrl: this.baseUrl,
                        data: JSON.stringify(p.after),
                        type: p.after.resourceType
                    }).then(response => {
                        if (!response || !response.data) return done('Not saved ' + p.after.id);
                        let obs = observationVM(response.data);
                        this.patientObservations.push(obs);
                        this.selectedEncounter.observations.push(obs);
                        done();
                    }, done);
                }
            };
            if (p.after.device && p.after.device.indexOf('Device/new') > -1) {
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
                    p.after.device = 'Device/' + response.data.id;
                    saveObservation(p, done);
                }, done);
            } else {
                saveObservation(p, done);
            }
        }, (err: string) => {
            if (err) this.saveMessage = err;
            else this.saved = true;
            setTimeout(() => this.saved = false, 5000);
            this.saving = false;
            this.loadFhirData();
            this.updateProgress();
        });
    }

    updateProgress() {
        this.patientForms.forEach(f => {
            this.getForm(f.tinyId, (err, form) => {
                this.loadFhirDataToForm(form);
                f.observed = 0;
                f.total = 0;
                f.percent = 0;
                iterateFeSync(form, () => {}, () => {}, q => {
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

