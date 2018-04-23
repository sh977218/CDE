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
    newEncounterDate: string;
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
    summary: boolean;
    fhirToCdeCodeMap = {
        'http://loinc.org': "LOINC",
        "LOINC": 'http://loinc.org',
        'http://unitsofmeasure.org': "UCUM",
        'UCUM': "http://unitsofmeasure.org"
    };
    static externalCodeSystems = [
        {id: 'LOINC', uri: 'http://loinc.org'},
        {id: 'UNITS', uri: 'http://unitsofmeasure.org/'},
    ];
    // static externalCodesDetail = {
    //     LOINC: {
    //         '18262-6': 'Low Density Lipoprotein Cholesterol',
    //         '2085-9': 'High Density Lipoprotein Cholesterol',
    //         '2093-3': 'Total Cholesterol',
    //         '2571-8': 'Triglycerides',
    //         '29463-7': 'Body Weight',
    //         '39156-5': 'Body Mass Index',
    //         '55284-4': 'Blood Pressure',
    //         '8302-2': 'Body Height',
    //         '8462-4': 'Diastolic Blood Pressure',
    //         '8480-6': 'Systolic Blood Pressure'
    //     }
    // };
    // static fhirObservations = {
    //     'LOINC 18262-6': {categoryCode: 'laboratory'},
    //     'LOINC 2085-9': {categoryCode: 'laboratory'},
    //     'LOINC 2093-3': {categoryCode: 'laboratory'},
    //     'LOINC 2571-8': {categoryCode: 'laboratory'},
    //     'LOINC 29463-7': {categoryCode: 'vital-signs'},
    //     'LOINC 39156-5': {categoryCode: 'vital-signs'},
    //     'LOINC 55284-4': {categoryCode: 'vital-signs'},
    //     'LOINC 8302-2': {categoryCode: 'vital-signs'}
    // };
    static readonly isTime = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[+-][0-9]{2}:[0-9]{2}$/;

    constructor(private http: HttpClient,
                public dialog: MatDialog,
                public snackBar: MatSnackBar) {

        let queryParams: any = FhirAppComponent.searchParamsGet();
        this.selectedProfileName = queryParams['selectedProfile'];
        if (queryParams['tinyId']) this.getForm(queryParams['tinyId'], this.methodLoadForm);
        else this.summary = true;

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

        this.updateProgress();
    }

    filterObservations() {
        this.selectedObservations = this.selectedEncounter
            ? this.selectedEncounter.observations : this.patientObservations;
    }

    static getCoding(system, code) {
        // let text = this.getCodeDisplay(system, code);
        return {
            coding: [{
                system: this.getCodeSystemOut(system),
                code: code,
                // display: text
            }],
            // text: text
        };
    }

    static getCodingsPreview(coding) {
        return coding.reduce(
            (a, v) => a += v.display + ' ' + this.getCodeSystem(v.system) + ':' + v.code + '\n', ''
        );
    }

    // static getCodeDisplay(system, code) {
    //     return this.externalCodesDetail[system][code];
    // }

    static getCodeSystem(uri) {
        let results = this.externalCodeSystems.filter(c => c.uri === uri);
        if (results.length) return results[0].id;
        else return 'no code system';
    }

    static getCodeSystemOut(system, fe = null) {
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

    getFormObservations(tinyId, cb) {
        function pushFormObservationNames(tinyId) {
            let map = FhirAppComponent.getFormMap(tinyId);
            map && map.mapping.forEach(m => {
                let key = m.resourceSystem + ' ' + m.resourceCode;
                if (m.resource === 'Observation' && !resourceObservationMap[key] && m.resourceCode !== '*') {
                    resourceObservationMap[key] = true;
                    observationNames.push(FhirAppComponent.getCodeSystemOut(m.resourceSystem)
                        + ' ' + m.resourceCode);
                }
            });
        }

        let resourceObservationMap = {};
        let observationNames = [];
        pushFormObservationNames(tinyId);
        this.getForm(tinyId, (err, elt) => {
            if (!err && elt) iterateFeSync(elt, form => { pushFormObservationNames(form.inForm.form.tinyId); });
            cb(err, observationNames);
        });
    }

    static getObservationValue(observation) {
        if (!observation) return undefined;
        if (observation.valueCodeableConcept) return this.getCodingsPreview(observation.valueCodeableConcept.coding);
        else if (observation.valueQuantity) {
            let quantity = observation.valueQuantity;
            if (quantity.value === undefined) return undefined;
            return quantity.value + ' ' + quantity.code + '(' + this.getCodeSystem(quantity.system) + ')';
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
                                this.patientObservations.push(FhirAppComponent.observationAdd(observation))
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
                (a, b) =>  {
                    let result = this.fhirToCdeCodeMap[a['system']] === b['source'] && a['code'] === b['id'];
                    if (result) console.log("match");
                    return result;
                });

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
            let obsCode = {
                system: "https://cde.nlm.nih.gov",
                code: formElt.question.cde.tinyId
            };
            formElt.question.cde.ids.forEach(id => {
                if (id.source === 'LOINC') {
                    obsCode.system = this.fhirToCdeCodeMap['LOINC'];
                    obsCode.code = id.id;
                }
            });
            let observation = this.createObs(obsCode, []);
            observation.valueQuantity = {
                value: formElt.question.answer
            };
            if (formElt.question.answerUom) {
                observation.valueQuantity.system = this.fhirToCdeCodeMap[formElt.question.answerUom.system];
                observation.valueQuantity.unit = formElt.question.answerUom.code;
            }

            this.submitFhirObservations.push(observation);
            this.submitFhirPending.push({before: null, after: observation});
        }
    }


    createObs (obsCode = null, compCodes = []) {
        let observation = FhirAppComponent.newObservationGet();
        observation.context.reference = 'Encounter/' + this.selectedEncounter.raw.id;
        observation.issued = this.selectedEncounter.date;
        observation.subject.reference = 'Patient/' + this.patient.id;
        if (obsCode) observation.code = FhirAppComponent.getCoding(obsCode.system, obsCode.code);

        // if (compCodes.length) {
        //     observation.component = [];
        //     compCodes.forEach(c => {
        //         observation.component.push({code: FhirAppComponent.getCoding(c.system, c.code)});
        //     });
        // }


        // TODO what is this?
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

    // mapIO(form, observations, mode, createCb = null) {
    //     let map = FhirAppComponent.getFormMap(form.tinyId ? form.tinyId : form.inForm.form.tinyId);
    //
    //     if (map && mode === 'in') {
    //         /* tslint:disable */ let encounterFn = eval('(' + map.encounterFn + ')'); /* tslint:enable */
    //         if (encounterFn) encounterFn(form, this.selectedEncounter);
    //     }
    //
    //     let resourceObservationMap = {};
    //     map && map.mapping.forEach(m => {
    //         let key = m.resourceSystem + ' ' + m.resourceCode;
    //         if (m.resource === 'Observation' && !Array.isArray(resourceObservationMap[key])) {
    //             if (m.resourceCode === '*') resourceObservationMap[key] = observations;
    //             else {
    //                 let system = FhirAppComponent.getCodeSystemOut(m.resourceSystem);
    //                 resourceObservationMap[key] = observations.filter(
    //                     o => o.code.coding.some(
    //                         c => c.system === system && c.code === m.resourceCode
    //                     )
    //                 );
    //                 if (createCb && resourceObservationMap[key].length === 0) {
    //                     let filtered = map.mapping
    //                         .filter(mo => mo.resourceComponentSystem && mo.resourceComponentCode
    //                             && mo.resourceSystem === m.resourceSystem && mo.resourceCode === m.resourceCode)
    //                         .map(mo => [
    //                             mo.resourceComponentSystem + ' ' + mo.resourceComponentCode,
    //                             {system: mo.resourceComponentSystem, code: mo.resourceComponentCode}
    //                         ]);
    //                     let components = Array.from((new Map(filtered)).values());
    //                     resourceObservationMap[key].push(
    //                         createCb({system: m.resourceSystem, code: m.resourceCode}, components));
    //                 }
    //             }
    //         }
    //     });
    //
    //     // update observations
    //     let patient = this.patient;
    //     let encounter = this.selectedEncounter;
    //     function parseDateTime(fe) {
    //         let m = moment(fe.question.answer);
    //         if (m.isValid()) {
    //             fe.question.answerDate = {year: m.year(), month: m.month() + 1, day: m.date()};
    //             fe.question.answerTime = {hour: m.hour(), minute: m.minute(), second: m.second()};
    //         }
    //     }
    //     function getValueQuantity(fe, uomSystem, uomCode = null, feUom = null) {
    //         return {
    //             value: fe.question.answer,
    //             unit: fe.question.answerUom || feUom && feUom.question.answer || uomCode,
    //             system: FhirAppComponent.getCodeSystemOut(uomSystem),
    //             code: fe.question.answerUom || feUom && feUom.question.answer || uomCode
    //         };
    //     }
    //     function setValueQuantity(fe, vq, feUom = null) {
    //         fe.question.answer = vq.value;
    //         if (feUom) feUom.question.answer = vq.unit;
    //         else fe.question.answerUom = vq.unit;
    //     }
    //     function getById(form, tinyId, instance = 0) {
    //         let count = -1;
    //         let result = null;
    //         function getByIdRecurse(fe, tinyId) {
    //             fe.formElements.forEach(f => {
    //                 if (f.elementType === 'section') getByIdRecurse(f, tinyId);
    //                 else if (f.elementType === 'form') {
    //                     if (f.inForm.form.tinyId === tinyId) {
    //                         count++;
    //                         if (count >= instance) return result = f;
    //                     }
    //                     getByIdRecurse(f, tinyId);
    //                 } else {
    //                     if (f.question.cde.tinyId === tinyId) {
    //                         count++;
    //                         if (count >= instance) return result = f;
    //                         f.question.answers.forEach(a => {
    //                             if (a.formElements && !result) {
    //                                 a.formElements.forEach(sq => !result && getByIdRecurse(sq, tinyId));
    //                             }
    //                         });
    //                     }
    //                 }
    //                 if (result) return;
    //             });
    //         }
    //         getByIdRecurse(form, tinyId);
    //         return result;
    //     }
    //     map && map.mapping.forEach(m => {
    //         function getByCode(form, instance = 0, system = null, code = null) {
    //             if (!system) system = m.resourceSystem;
    //             if (!code) code = m.resourceCode;
    //             let count = -1;
    //             let result = null;
    //             function getByCodeRecurse(fe) {
    //                 fe.formElements.forEach(f => {
    //                     if (f.elementType === 'section') getByCodeRecurse(f);
    //                     else if (f.elementType === 'form') {
    //                         if (f.inForm.form.ids.filter(id => id.source === system && id.id === code).length) {
    //                             count++;
    //                             if (count >= instance) return result = f;
    //                         }
    //                         getByCodeRecurse(f);
    //                     } else {
    //                         if (f.question.cde.ids.filter(id => id.source === system && id.id === code).length) {
    //                             count++;
    //                             if (count >= instance) return result = f;
    //                             f.question.answers.forEach(a => {
    //                                 if (a.formElements && !result) {
    //                                     a.formElements.forEach(sq => !result && getByCodeRecurse(sq));
    //                                 }
    //                             });
    //                         }
    //                     }
    //                     if (result) return;
    //                 });
    //             }
    //             getByCodeRecurse(form);
    //             return result;
    //         }
    //         function getSubByCode(form, instance = 0) {
    //             return getByCode(getByCode(form), 0, m.resourceComponentSystem, m.resourceComponentCode);
    //         }
    //         function getComponent(res) {
    //             let system = FhirAppComponent.getCodeSystemOut(m.resourceComponentSystem);
    //             let code = m.resourceComponentCode;
    //             if (res.component) {
    //                 let components = res.component.filter(comp => comp.code.coding.some(
    //                     c => c.system === system && c.code === code
    //                 ));
    //                 if (components.length) return components[0];
    //                 else return null;
    //             } else {
    //                 res.component = {};
    //                 return res.component;
    //             }
    //         }
    //         let key = m.resourceSystem + ' ' + m.resourceCode;
    //         if (m.resource === 'Observation' && resourceObservationMap[key]
    //             && (mode === 'in' && m.inFn || mode === 'out' && m.outFn)) {
    //             resourceObservationMap[key].forEach(o => {
    //                 /* tslint:disable */ let resFn = eval('(' + m.resourcePropertyObj + ')'); /* tslint:enable */
    //                 if (!resFn) resFn = obj => obj;
    //
    //                 if (mode === 'in') {
    //                     /* tslint:disable */ let inFn = eval('(' + m.inFn + ')'); /* tslint:enable */
    //                     if (inFn) inFn(form, resFn(o)[m.resourceProperty]);
    //                 } else if (mode === 'out') {
    //                     /* tslint:disable */ let outFn = eval('(' + m.outFn + ')'); /* tslint:enable */
    //                     if (outFn) resFn(o)[m.resourceProperty] = outFn(form);
    //                 }
    //             });
    //         }
    //     });
    // }

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

    static observationAdd(observation) {
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

    openViewObs () {
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
            if (FhirAppComponent.getObservationValue(p.before) === FhirAppComponent.getObservationValue(p.after)) {
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
                    let obs = FhirAppComponent.observationAdd(response.data);
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
                    let obs = FhirAppComponent.observationAdd(response.data);
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


    // TODO this is not working yet
    updateProgress() {
        this.patientForms.forEach(f => {
            if (f.tinyId) {
                this.getFormObservations(f.tinyId, (err, names) => {
                    f.observed = this.selectedEncounter.observations.filter(
                        o => o.raw.code.coding.some(c => names.indexOf(c.system + ' ' + c.code) > -1)
                    ).length;
                    f.total = names.length;
                    f.percent = 100 * f.observed / f.total;
                });
            }
            else {
                f.observed = 0;
                f.total = 0;
                f.percent = 0;
            }
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

