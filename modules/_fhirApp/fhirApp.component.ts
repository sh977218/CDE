import { HttpClient } from '@angular/common/http';
import { Component, Inject, ViewChild } from '@angular/core';
import async_forEach from 'async/forEach';
import async_parallel from 'async/parallel';
import * as moment from 'moment/min/moment.min';
import 'fhirclient';

import { mappings } from '_nativeRenderApp/fhirMapping';
import { CdeForm, DisplayProfile } from 'shared/form/form.model';
import { iterateFeSync } from 'shared/form/formShared';

import _intersectionWith from 'lodash/intersectionWith';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { CdeId } from "../../shared/models.model";

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
    elt: CdeForm;
    errorMessage: string;
    methodLoadForm = this.loadForm.bind(this);
    newEncounter: boolean;
    newEncounterDate: string = new Date().toISOString().slice(0, 16);
    newEncounterErrorMessage: string;
    newEncounterReason: string;
    newEncounterType: string = 'Outpatient Encounter';
    newEncounterValid: boolean;
    patient: any;
    patientForms: any = [
        {name: 'FHIR: Vital Signs', tinyId: 'Xk8LrBb7V'},
        {name: 'FHIR: Laboratory Cholesterol', tinyId: 'X1_IXy_L4'}
    ];
    patientEncounters = [];
    patientObservations = [];
    patientOrganization: any;
    saveMessage: string = null;
    selectedEncounter: any;
    selectedObservations = []; // display data only
    selectedProfile: DisplayProfile;
    selectedProfileName: string;
    submitFhirPending = [];
    submitFhirObservations = [];
    smart;
    ioInProgress: boolean;
    saving: boolean;
    saved: boolean;
    summary: boolean = true;
    fhirToCdeCodeMap = {
        'http://loinc.org': "LOINC",
        "LOINC": 'http://loinc.org',
        'http://unitsofmeasure.org': "UCUM",
        'UCUM': "http://unitsofmeasure.org"
    };
    externalCodeSystems = [
        {id: 'LOINC', uri: 'http://loinc.org'},
        {id: 'UCUM', uri: 'http://unitsofmeasure.org'}
    ];

    codeToDisplay = {};

    static readonly isTime = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[+-][0-9]{2}:[0-9]{2}$/;


    constructor(private http: HttpClient,
                public dialog: MatDialog,
                public snackBar: MatSnackBar) {

        let queryParams: any = FhirAppComponent.searchParamsGet();
        this.selectedProfileName = queryParams['selectedProfile'];

        this.patientForms.forEach(f => {
            this.http.get<CdeForm>('/form/' + f.tinyId).subscribe(form => {
                iterateFeSync(form, () => {}, () => {}, q => {
                    q.question.cde.ids.forEach(id => {
                        if (id.source === 'LOINC') {
                            this.http.get("/umlsCuiFromSrc/" + id.id + "/LNC").subscribe((r: any) => {
                                if (r && r.result && r.result.results.length) {
                                    this.codeToDisplay[id.source + ":" + id.id] = r.result.results[0].name.split(":")[0];
                                }
                            });
                        }
                    });
                    let localCdeId = new CdeId();
                    localCdeId.source = "https://cde.nlm.nih.gov";
                    localCdeId.id = q.question.cde.tinyId;
                    q.question.cde.ids.push(localCdeId);
                });
            });
        });

        // if (queryParams['tinyId']) this.getForm(queryParams['tinyId'], this.methodLoadForm);
        // else this.summary = true;

        if (queryParams['state']) this.loadPatientData();
        else if (queryParams['iss']) {
            (<any>window).FHIR.oauth2.authorize({
                'client_id': 'e17575b9-f89b-49c1-a9c2-52c68f1d273c',
                'redirect_uri': 'http://localhost:3001/fhir/form',
                'scope':  'patient/*.*'
            });
        }
    }


    encounterAdd(encounter) {
        this.patientEncounters.push({
            type: encounter.type ? encounter.type.map(e => e.text).join(', ') : null,
            reason: encounter.reason
                ? encounter.reason.map(r => r.coding.length ? r.coding[0].display : '') : null,
            date: encounter.period.start,
            observations: [],
            raw: encounter
        });
    }

    encounterSelected() {
        this.filterObservations();
        if (!this.selectedEncounter) return;


        this.patientForms.forEach(f => {
            this.loadFhirDataToForm(f);
        });
        this.updateProgress();
    }

    filterObservations() {
        this.selectedObservations = this.selectedEncounter
            ? this.selectedEncounter.observations : this.patientObservations;
    }

    getCodingsPreview(coding) {
        return coding.reduce(
            (a, v) => a += v.display + ' ' + this.getCodeSystem(v.system) + ':' + v.code + '\n', ''
        );
    }

    getCodeSystem(uri) {
        let results = this.externalCodeSystems.filter(c => c.uri === uri);
        if (results.length) return results[0].id;
        else return 'no code system';
    }

    getCodeSystemOut(system, fe = null) {
        let s = system;
        if (fe && fe.question && fe.question.cde && Array.isArray(fe.question.cde.ids) && fe.question.cde.ids.length) {
            s = fe.question.cde.ids[0].source;
        }

        let external = this.externalCodeSystems.filter(e => e.id === s);
        if (external.length) return external[0].uri;
        else return s;
    }

    getForm(tinyId, cb) {
        if (!this.selectedEncounter) {
            return this.snackBar.open("Select an encounter to open a form.", "", {duration: 2000});
        }

        this.http.get<CdeForm>('/form/' + tinyId).subscribe(elt => {
            CdeForm.validate(elt);
            cb(null, elt);
        }, err => cb(err.statusText));
    }

    static getFormMap(tinyId) {
        let maps = mappings.filter(m => m.form === tinyId
            && m.type === 'external'
            && m.system === 'http://hl7.org/fhir'
            && m.code === '*'
            && m.format === 'json'
        );
        if (maps.length) return maps[0];
        else return null;
    }

    // getFormObservations(tinyId, cb) {
    //     // let pushFormObservationNames = tinyId => {
    //     //     let map = FhirAppComponent.getFormMap(tinyId);
    //     //     map && map.mapping.forEach(m => {
    //     //         let key = m.resourceSystem + ' ' + m.resourceCode;
    //     //         if (m.resource === 'Observation' && !resourceObservationMap[key] && m.resourceCode !== '*') {
    //     //             resourceObservationMap[key] = true;
    //     //             observationNames.push(this.getCodeSystemOut(m.resourceSystem)
    //     //                 + ' ' + m.resourceCode);
    //     //         }
    //     //
    //     //     });
    //     // };
    //     //
    //     let resourceObservationMap = {};
    //     let observationNames = [];
    //     // pushFormObservationNames(tinyId);
    //     this.getForm(tinyId, (err, elt) => {
    //         if (!err && elt) {
    //             // iterateFeSync(elt, form => pushFormObservationNames(form.inForm.form.tinyId), () => {}, q => {
    //             iterateFeSync(elt, () => {}, () => {}, q => {
    //                 q.question.cde.ids.forEach(id => {
    //                     if (id.source === 'LOINC') {
    //                         this.http.get("/umlsCuiFromSrc/" + id.id + "/LNC").subscribe((r: any) => {
    //                             if (r && r.result && r.result.results.length) {
    //                                 this.codeToDisplay[id.source + ":" + id.id] = r.result.results[0].name.split(":")[0];
    //                                 console.log(this.codeToDisplay);
    //                             }
    //                         });
    //                     }
    //                 });
    //                 let localCdeId = new CdeId();
    //                 localCdeId.source = "https://cde.nlm.nih.gov";
    //                 localCdeId.id = q.question.cde.tinyId;
    //                 q.question.cde.ids.push(localCdeId);
    //             });
    //         }
    //         cb(err, observationNames);
    //     });
    // }

    getObservationValue(observation) {
        if (!observation) return undefined;
        if (observation.valueCodeableConcept) return this.getCodingsPreview(observation.valueCodeableConcept.coding);
        else if (observation.valueQuantity) {
            let quantity = observation.valueQuantity;
            if (quantity.value === undefined) return undefined;
            return quantity.value + ' ' + (quantity.code || "(no unit)") + ' (' + this.getCodeSystem(quantity.system) + ')';
        } else if (observation.component) {
            let value = observation.component.reduce((a, v) => {
                let vs = this.getObservationValue(v);
                if (vs === undefined) return a;
                return a + this.getCodingsPreview(v.code.coding) + ' = ' + vs + '\n';
            }, '');
            if (value === '') return undefined;
            else return value;
        } else return JSON.stringify(observation);
    }

    getPatientName() {
        if (this.patient) {
            let name = this.patient.name.filter(name => name.use === 'official')[0];
            if (!name) name = this.patient.name[0];
            return name.family + ', ' + name.given.join(' ');
        }
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
                                this.patientObservations.push(this.observationAdd(observation))
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
                    if (a.date > b.date) return 1;
                    else if (a.date < b.date) return -1;
                    else return 0;
                });
                this.patientObservations.forEach(o => {
                    if (o.encounter && o.encounter.startsWith('Encounter/')) {
                        let id = o.encounter.substr(10);
                        let encounters = this.patientEncounters.filter(e => e.raw.id === id);
                        if (encounters.length) encounters[0].observations.push(o);
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
        iterateFeSync(formElt, this.loadFhirDataToForm.bind(this), this.loadFhirDataToForm.bind(this), this.mapInputQuestion.bind(this));
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

    mapInputQuestion (formElt) {
        let observations = this.selectedEncounter.observations.map(o => o.raw);
        formElt.question.cde.ids.push({source: "https://cde.nlm.nih.gov", id: formElt.question.cde.tinyId});
        observations.forEach(o => {
            let matchedCodes = _intersectionWith(
                o.code.coding,
                formElt.question.cde.ids,
                (a, b) =>  this.fhirToCdeCodeMap[a['system']] === b['source'] && a['code'] === b['id']);
            if (matchedCodes.length) {
                formElt.question.answer = o.valueQuantity.value;
                formElt.question.unitsOfMeasure.forEach(feUom => {
                   if (feUom.system === this.fhirToCdeCodeMap[o.valueQuantity.system]
                    && feUom.code === o.valueQuantity.unit) {
                       formElt.question.answerUom = feUom;
                   }
                });
            }
        });
    }


    updateObservation (formElt) {
        let observations = this.selectedEncounter.observations.map(o => o.raw);
        let foundObs = false;
        // formElt.question.cde.ids.push({source: "https://cde.nlm.nih.gov", id: formElt.question.cde.tinyId});
        observations.forEach(o => {
            let copy = JSON.parse(JSON.stringify(o));
            let matchedCodes = _intersectionWith(
                o.code.coding,
                formElt.question.cde.ids,
                (a, b) => this.fhirToCdeCodeMap[a['system']] === b['source'] && a['code'] === b['id']
            );

            if (matchedCodes.length) {
                copy.valueQuantity.value = formElt.question.answer;
                if (formElt.question.answerUom) {
                    copy.valueQuantity.system = this.fhirToCdeCodeMap[formElt.question.answerUom.system];
                    copy.valueQuantity.unit = formElt.question.answerUom.code;

                }
                foundObs = true;
                this.submitFhirObservations.push(copy);
                this.submitFhirPending.push({before: o, after: copy});
            }
        });
        if (!foundObs && formElt.question.answer) {
            let observation = this.createObs(formElt);
            observation.valueQuantity = {
                value: formElt.question.answer
            };
            if (formElt.question.answerUom) {
                observation.valueQuantity.system = this.fhirToCdeCodeMap[formElt.question.answerUom.system];
                observation.valueQuantity.unit = formElt.question.answerUom.code;
                observation.valueQuantity.code = formElt.question.answerUom.code;
            }

            this.submitFhirObservations.push(observation);
            this.submitFhirPending.push({before: null, after: observation});
        }
    }

    createObs (formElt) {
        let obsCode = {
            system: "https://cde.nlm.nih.gov",
            code: formElt.question.cde.tinyId,
            display: formElt.question.cde.name
        };
        formElt.question.cde.ids.forEach(id => {
            if (id.source === 'LOINC') {
                obsCode.system = this.fhirToCdeCodeMap['LOINC'];
                obsCode.code = id.id;
                obsCode.display = this.codeToDisplay[id.source + ":" + id.id];
            }
        });

        let observation = FhirAppComponent.newObservationGet();
        observation.context.reference = 'Encounter/' + this.selectedEncounter.raw.id;
        observation.issued = this.selectedEncounter.date;
        observation.subject.reference = 'Patient/' + this.patient.id;

        // if (obsCode) observation.code = this.getCoding(obsCode.system, obsCode.code);
        if (obsCode) {
            observation.code = {
                coding: [{
                    system: this.getCodeSystemOut(obsCode.system),
                    code: obsCode.code,
                    display: obsCode.display
                }],
                text: obsCode.display
            };
        }

        // if (compCodes.length) {
        //     observation.component = [];
        //     compCodes.forEach(c => {
        //         observation.component.push({code: FhirAppComponent.getCoding(c.system, c.code)});
        //     });
        // }

        // let category = FhirAppComponent.fhirObservations[obsCode.system + ' ' + obsCode.code];
        // if (category) {
        //     observation.category.push({
        //         coding: [{
        //             system: 'http://hl7.org/fhir/observation-category',
        //             code: category.categoryCode
        //         }]
        //     });
        // }

        return observation;
    }

    newEncounterAdd() {
        this.smart.patient.api.create({
            baseUrl: 'https://api-v5-stu3.hspconsortium.org/LLatLO/data/',
            type: 'Encounter',
            data: JSON.stringify(this.newEncounterGet())
        }).then(response => {
            if (response.data && response.data.resourceType === 'Encounter') this.encounterAdd(response.data);
            this.newEncounterReset();
        });
    }

    newEncounterGet() {
        let encounter = {
            resourceType: 'Encounter',
            id: null,
            status: 'finished',
            class: {'code': 'outpatient'},
            type: [{'coding': [{'system': 'http://snomed.info/sct', 'code': '185349003'}], 'text': 'Outpatient Encounter'}],
            period: {'start': null, 'end': null},
            serviceProvider: {
                reference: null
            },
            subject: {
                reference: null
            }
        };
        encounter.period.start = encounter.period.end = this.newEncounterDate + ":00-00:00";
        encounter.subject.reference = 'Patient/' + this.patient.id;
        if (this.patientOrganization) encounter.serviceProvider.reference = 'Organization/' + this.patientOrganization.id;
        delete encounter.id;
        return encounter;
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

    static newObservationGet(): any {
        return {
            resourceType: 'Observation',
            id: null,
            status: 'final',
            category: [],
            code: null,
            subject: {
                reference: null
            },
            context: {
                reference: null
            },
            effectiveDateTime: null,
            issued: null
        };
    }

    observationAdd(observation) {
        return {
            code: observation.code
                ? this.getCodingsPreview(observation.code.coding)
                : JSON.stringify(observation),
            value: this.getObservationValue(observation),
            date: observation.issued,
            encounter: observation.context ? observation.context.reference : undefined,
            raw: observation
        };
    }

    openViewObs (e) {
        this.selectedEncounter = e;
        this.encounterSelected();
        this.dialog.open(ViewFhirObservationDialogComponent, {
            width: '700px',
            data: { selectedObservations: this.selectedObservations}
        });
    }

    static searchParamsGet(): string[] {
        let params: any = {};
        location.search && location.search.substr(1).split('&').forEach(e => {
            let p = e.split('=');
            if (p.length === 2) params[p[0]] = decodeURI(p[1]);
            else params[p[0]] = null;
        });
        return params;
    }

    prepareObservations(formElt) {
        iterateFeSync(formElt, undefined, undefined, this.updateObservation.bind(this));
    }

    submitFhir() {
        this.saving = true;

        this.submitFhirPending = [];
        this.submitFhirObservations = [];

        this.prepareObservations(this.elt);

        // identify changed and submit to server
        for (let i = 0; i < this.submitFhirPending.length; i++) {
            let p = this.submitFhirPending[i];
            if (this.getObservationValue(p.before) === this.getObservationValue(p.after)) {
                this.submitFhirPending.splice(i, 1);
                i--;
            }
        }
        // TODO: refresh before copy from server and compare again to prevent save with conflict
        async_forEach(this.submitFhirPending, (p, done) => {
            if (p.before) {
                this.smart.api.update({
                    data: JSON.stringify(p.after),
                    id: p.after.id,
                    type: p.after.resourceType
                }).then(response => {
                    if (!response || !response.data) return done('Not saved ' + p.after.id);
                    let obs = this.observationAdd(response.data);
                    let index = this.patientObservations.findIndex(o => o.raw === p.before);
                    if (index > -1) this.patientObservations[index] = obs;
                    index = this.selectedEncounter.observations.findIndex(o => o.raw === p.before);
                    if (index > -1) this.selectedEncounter.observations[index] = obs;
                    done();
                }, done);
            }
            else {
                this.smart.patient.api.create({
                    baseUrl: 'https://sb-fhir-stu3.smarthealthit.org/smartstu3/data/',
                    data: JSON.stringify(p.after),
                    type: 'Observation'
                }).then(response => {
                    if (!response || !response.data) return done('Not saved ' + p.after.id);
                    let obs = this.observationAdd(response.data);
                    this.patientObservations.push(obs);
                    this.selectedEncounter.observations.push(obs);
                    done();
                });
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
                     if (q.question.answer) f.observed++;
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
                    <td>{{o.code}}</td>
                    <td><pre>{{o.value}}</pre></td>
                    <td>{{o.date}}</td>
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
    constructor(
        public dialogRef: MatDialogRef<ViewFhirObservationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

}

