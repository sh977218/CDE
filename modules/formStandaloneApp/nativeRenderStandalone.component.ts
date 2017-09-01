import { Component } from "@angular/core";
import { Http } from "@angular/http";
import * as async from "async";
import * as moment from 'moment';
import "fhirclient";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { blankEncounter, blankObservation, mappings } from "./fhirMapping";

@Component({
    selector: "cde-native-render-standalone",
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
        .addBtn {
            background-color: #61c200;
            color: white;
            margin-left: 0;
            padding: 4px 8px 2px 8px;
            vertical-align: baseline;
        }
    `],
    templateUrl: "./nativeRenderStandalone.component.html"
})
export class NativeRenderStandaloneComponent {
    elt: any;
    errorMessage: string;
    newEncounter = false;
    newEncounterDate: string;
    newEncounterErrorMessage: string;
    newEncounterReason: string;
    newEncounterType: string = 'Outpatient Encounter';
    newEncounterValid = false;
    panelType: string;
    patient: any;
    patientForms: any = [
        {name: 'FHIR: Vital Signs', tinyId: 'Xk8LrBb7V', id: '599f0e0998032c744f2f1ed9'},
        {name: 'Medical History', tinyId: '7JbBE1HrKg'},
        {name: 'Vital Signs', tinyId: 'QJDOLkSHFx'}
    ];
    patientEncounters = [];
    patientObservations = [];
    selectedEncounter: any;
    selectedObservations = []; // display data only
    selectedProfile: string;
    showData = false;
    smart;
    submitForm: boolean;
    submitFhirObservations: any[];
    submitFhirPending: any[];
    summary = false;
    externalCodeSystems = [
        {id: 'LOINC', uri: 'http://loinc.org'},
        {id: 'UNITS', uri: 'http://unitsofmeasure.org/'},
    ];
    static readonly isTime = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[+-][0-9]{2}:[0-9]{2}$/;

    constructor(private http: Http) {
        let args: any = NativeRenderStandaloneComponent.searchParamsGet();
        this.selectedProfile = args.selectedProfile;
        this.submitForm = args.submit !== undefined;
        this.panelType = args.panelType;

        if ((<any>window).formElt) {
            this.fetch(null, (<any>window).formElt);
        } else {
            let _id = args.tinyId ? args.tinyId : (args._id ? args._id + "" : undefined);
            if (_id)
                this.loadForm(_id);
            else
                this.summary = true;

            if (args.state)
                this.loadFhir();
            else if (args.iss)
                (<any>window).FHIR.oauth2.authorize({
                    "client_id": "fb79d476-933f-4c99-946d-017283830d1a",
                    "redirect_uri": "http://localhost:3001/form/public/html/nativeRenderStandalone.html?panelType=patient",
                    "scope":  "patient/*.*"
                });
        }
    }

    encounterAdd(encounter) {
        this.patientEncounters.push({
            type: encounter.type ? encounter.type.map(e => e.text).join(", ") : null,
            reason: encounter.reason
                ? encounter.reason.map(r => r.coding.length ? r.coding[0].display : '') : null,
            date: encounter.period.start,
            observations: [],
            raw: encounter
        });
    }

    encounterSelected() {
        this.filterObservations();

        this.patientForms.forEach(f => {
            let names = f.id ? NativeRenderStandaloneComponent.getFormObservationNames(f.id) : [];
            if (names.length) {
                f.observed = this.selectedEncounter.observations.filter(
                    o => o.raw.code.coding.filter(c => names.indexOf(c.display) > -1).length > 0
                ).length;
                f.total = names.length;
                f.percent = 100 * f.observed / f.total;
            } else {
                f.observed = 0;
                f.total = 0;
                f.percent = 0;
            }
        });
    }

    fetch(error, form = null, cb = null) {
        if (error) {
            this.errorMessage = "Sorry, we are unable to retrieve this element.";
            return;
        }

        let formCopy = JSON.parse(JSON.stringify(form));
        this.fetchWholeForm(formCopy, (wholeForm) => {
            this.elt = wholeForm;
            if (cb)
                cb();
        });
    }

    fetchWholeForm(form, callback) {
        let maxDepth = 8;
        let depth = 0;
        let loopFormElements = (form, cb) => {
            depth++;
            if (form.formElements) {
                async.forEach(form.formElements, (fe, doneOne) => {
                    if (fe.elementType === 'form') {
                        if (depth < maxDepth) {
                            this.http.get('/form/' + fe.inForm.form.tinyId + '/version/' + fe.inForm.form.version)
                                .map(res => res.json())
                                .subscribe((response) => {
                                    fe.formElements = response.formElements;
                                    loopFormElements(fe, function () {
                                        depth--;
                                        doneOne();
                                    });
                                });
                        }
                        else doneOne();
                    } else if (fe.elementType === 'section') {
                        loopFormElements(fe, doneOne);
                    } else {
                        if (fe.question.cde.derivationRules)
                            fe.question.cde.derivationRules.forEach(function (derRule) {
                                delete fe.incompleteRule;
                                if (derRule.ruleType === 'score') {
                                    fe.question.isScore = true;
                                    fe.question.scoreFormula = derRule.formula;
                                }
                            });
                        doneOne();
                    }
                }, cb);
            }
            else cb();
        };
        loopFormElements(form, function () {
            callback(form);
        });
    }

    filterObservations() {
        this.selectedObservations = this.selectedEncounter
            ? this.selectedEncounter.observations : this.patientObservations;
    }

    getCodings(coding) {
        return coding.reduce(
            (a, v) => a += v.display + ' ' + this.getCodeSystem(v.system) + ':' + v.code + '\n', ''
        );
    }

    getCodeSystem(uri) {
        let results = this.externalCodeSystems.filter(c => c.uri === uri);
        if (results.length)
            return results[0].id;
        else
            return 'unknown';
    }

    getCodeSystemOut(system, fe = null) {
        let s = system;
        if (fe && fe.question && fe.question.cde && Array.isArray(fe.question.cde.ids) && fe.question.cde.ids.length)
            s = fe.question.cde.ids[0].source;

        let external = this.externalCodeSystems.filter(e => e.id === s);
        if (external.length)
            return external[0].uri;
        else
            return s;
    }

    static getFormObservationNames(id) {
        let maps = mappings.filter(m => m.form === id
            && m.type === 'external'
            && m.system === 'http://hl7.org/fhir'
            && m.code === 'multi'
            && m.format === 'json'
        );
        if (!maps.length)
            return [];
        let map = maps[0];

        let resourceObservationMap = {};
        let observationNames = [];
        map.mapping.forEach(m => {
            if (m.resource === 'Observation' && !resourceObservationMap[m.resourceSystem + ' ' + m.resourceCode] && m.resourceCode !== '*') {
                resourceObservationMap[m.resourceSystem + ' ' + m.resourceCode] = true;
                observationNames.push(m.resourceSystem + ' ' + m.resourceCode);
            }
        });

        return observationNames;
    }

    getObservationValue(observation) {
        if (observation.valueCodeableConcept)
            return this.getCodings(observation.valueCodeableConcept.coding);
        else if (observation.valueQuantity) {
            let quantity = observation.valueQuantity;
            return quantity.value + ' ' + quantity.code + '(' + this.getCodeSystem(quantity.system) + ')';
        } else if (observation.component)
            return observation.component.reduce(
                (a, v) => a += this.getCodings(v.code.coding) + ' = ' + this.getObservationValue(v) + '\n', ''
            );
        else
            return JSON.stringify(observation);
    }

    getPatientName() {
        if (this.patient) {
            let name = this.patient.name.filter(name => name.use === 'official')[0];
            return name.family + ', ' + name.given.join(" ");
        }
    }

    loadFhir() {
        (<any>window).FHIR.oauth2.ready(smart => {
            this.smart = smart;
            this.smart.patient.read()
                .then(pt => {
                    this.patient = pt;
                });

            async.parallel([
                cb => {
                    this.smart.patient.api.fetchAll({type: "Encounter"})
                        .then((results, refs) => {
                            results.forEach(encounter => {
                                this.encounterAdd(encounter);
                            });
                            cb();
                        });
                },
                cb => {
                    this.smart.patient.api.fetchAll({type: "Observation"})
                        .then((results, refs) => {
                            results.forEach(observation => {
                                this.patientObservations.push({
                                    code: observation.code ? this.getCodings(observation.code.coding) : JSON.stringify(observation),
                                    value: this.getObservationValue(observation),
                                    date: observation.issued,
                                    encounter: observation.context.reference,
                                    raw: observation
                                });
                            });
                            cb();
                        });
                }
            ], () => {
                this.patientEncounters.sort(function (a, b) {
                    if (a.date > b.date)
                        return 1;
                    else if (a.date < b.date)
                        return -1;
                    else
                        return 0;
                });
                this.patientObservations.forEach(o => {
                    if (o.encounter && o.encounter.startsWith('Encounter/')) {
                        let id = o.encounter.substr(10);
                        let encounters = this.patientEncounters.filter(e => e.raw.id === id);
                        if (encounters.length)
                            encounters[0].observations.push(o);
                    }
                });
                this.filterObservations();
            });
        });
    }

    loadFhirData() {
        if (!this.selectedEncounter)
            return;

        this.loadFhirDataForm(this.elt);
    }

    loadFhirDataForm(form) {
        let maps = mappings.filter(m => m.form === form._id
            && m.type === 'external'
            && m.system === 'http://hl7.org/fhir'
            && m.code === 'multi'
            && m.format === 'json'
        );
        if (!maps.length)
            return;
        let map = maps[0];

        let resourceObservationMap = {};
        map.mapping.forEach(m => {
            if (m.resource === 'Observation' && !Array.isArray(resourceObservationMap[m.resourceSystem + ' ' + m.resourceCode])) {
                if (m.resourceCode === '*')
                    resourceObservationMap[m.resourceSystem + ' ' + m.resourceCode] = this.selectedEncounter.observations;
                else
                    resourceObservationMap[m.resourceSystem + ' ' + m.resourceCode] = this.selectedEncounter.observations.filter(
                        o => o.raw.code.coding.filter(
                            c => c.system === m.resourceSystem && c.code === m.resourceCode
                        ).length > 0
                    );
            }
        });

        let encounter = this.selectedEncounter;
        let parseDateTime = function parseDateTime(fe) {
            let m = moment(fe.question.answer);
            if (m.isValid()) {
                fe.question.answerDate = {year: m.year(), month: m.month() + 1, day: m.date()};
                fe.question.answerTime = {hour: m.hour(), minute: m.minute(), second: m.second()};
            }
        };
        function getValueQuantity(fe, uomSystem, uomCode = null, feUom = null) {
            return {
                value: fe.question.answer,
                unit: fe.question.answerUom || feUom && feUom.question.answer || uomCode,
                system: this.getCodeSystemOut(uomSystem),
                code: fe.question.answerUom || feUom && feUom.question.answer || uomCode
            };
        }
        function setValueQuantity(fe, vq, feUom = null) {
            fe.question.answer = vq.value;
            if (feUom)
                feUom.question.answer = vq.unit;
            else
                fe.question.answerUom = vq.unit;
        }
        function getById(form, tinyId, instance = 0) {
            let count = -1;
            let result = null;
            function getByIdRecurse(fe, tinyId) {
                fe.formElements.forEach(f => {
                    if (f.elementType === 'section')
                        getByIdRecurse(f, tinyId);
                    else if (f.elementType === 'form') {
                        if (f.inForm.form.tinyId === tinyId) {
                            count++;
                            if (count >= instance)
                                return result = f;
                        }
                        getByIdRecurse(f, tinyId);
                    } else {
                        if (f.question.cde.tinyId === tinyId) {
                            count++;
                            if (count >= instance)
                                return result = f;
                            f.question.answers.forEach(a => {
                                if (a.subQuestions && !result)
                                    a.subQuestions.forEach(sq => !result && getByIdRecurse(sq, tinyId));
                            });
                        }
                    }
                    if (result) return;
                });
            }
            getByIdRecurse(form, tinyId);
            return result;
        }
        map.mapping.forEach(m => {
            function getByCode(form, instance = 0) {
                let count = -1;
                let result = null;
                function getByCodeRecurse(fe) {
                    form.formElements.forEach(f => {
                        if (f.elementType === 'section')
                            getByCodeRecurse(f);
                        else if (f.elementType === 'form') {
                            if (f.inForm.ids.filter( // bad, needs ids[]
                                    id => id.source === m.resourceSystem && id.id === m.resourceCode).length
                            ) {
                                count++;
                                if (count >= instance)
                                    return result = f;
                            }
                            getByCodeRecurse(f);
                        } else {
                            if (f.question.cde.ids.filter(
                                id => id.source === m.resourceSystem && id.id === m.resourceCode).length
                            ) {
                                count++;
                                if (count >= instance)
                                    return result = f;
                                f.question.answers.forEach(a => {
                                    if (a.subQuestions && !result)
                                        a.subQuestions.forEach(sq => !result && getByCodeRecurse(sq));
                                });
                            }
                        }
                        if (result) return;
                    });
                }
                getByCodeRecurse(form);
                return result;
            }
            function getSubByCode(form, instance = 0) {
                // use m from closure
                // return fe by subform by system/code then by system/code
                // inject functions as methods getValueQuantity setValueQuantity
            }
            if (m.resource === 'Observation' && m.inFn && resourceObservationMap[m.resourceSystem + ' ' + m.resourceCode]) {
                resourceObservationMap[m.resourceSystem + ' ' + m.resourceCode].forEach(o => {
                    /* tslint:disable */ let resFn = eval('(' + m.resourceObj + ')'); /* tslint:enable */
                    /* tslint:disable */ let inFn = eval('(' + m.inFn + ')'); /* tslint:enable */
                    if (inFn) {
                        if (resFn)
                            inFn(form, resFn(o.raw)[m.resourceProperty]);
                        else
                            inFn(form, o.raw[m.resourceProperty]);
                    }
                });
            }
        });

        form.formElements.forEach(fe => {
            if (fe.elementType === 'form')
                this.loadFhirDataForm(fe);
        });
    }

    loadForm(id) {
        this.http.get('/form/' + id).map(res => res.json()).subscribe(response => {
            this.fetch(null, response, () => {
                this.loadFhirData();
            });
        }, () => {
            this.fetch(true);
        });
    }

    newEncounterAdd() {
        this.smart.patient.api.create({
            baseUrl: 'https://sb-fhir-stu3.smarthealthit.org/smartstu3/data/',
            type: "Encounter",
            data: JSON.stringify(this.newEncounterGet())
        }).then(response => {
            if (response.data && response.data.resourceType === 'Encounter')
                this.encounterAdd(response.data);
            this.newEncounterReset();
        });
    }

    newEncounterGet() {
        let encounter = JSON.parse(JSON.stringify(blankEncounter));
        encounter.period.start = encounter.period.end = this.newEncounterDate;
        encounter.subject.reference = 'Patient/' + this.patient.id;
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
        } else if (!NativeRenderStandaloneComponent.isTime.exec(this.newEncounterDate)) {
            this.newEncounterErrorMessage = 'Error: Invalid date format. Needs to be in format YYYY-MM-DDTHH:MM:SS-HH:MM';
            this.newEncounterValid = false;
        } else {
            this.newEncounterErrorMessage = '';
            this.newEncounterValid = true;
        }
    }

    static newObjservationGet(encounter) {
        return JSON.parse(JSON.stringify(blankObservation));
    }

    static searchParamsGet(): string[] {
        let params: any = {};
        location.search && location.search.substr(1).split('&').forEach(e => {
            let p = e.split('=');
            if (p.length === 2)
                params[p[0]] = decodeURI(p[1]);
            else
                params[p[0]] = null;
        });
        return params;
    }

    submitFhir() {
        this.submitFhirPending = [];

        let maps = mappings.filter(m => m.form === this.elt._id
            && m.type === 'external'
            && m.system === 'http://hl7.org/fhir'
            && m.code === 'multi'
            && m.format === 'json'
        );
        if (!maps.length)
            return;
        let map = maps[0];

        this.submitFhirObservations = [];
        this.submitFhirPending = [];
        this.selectedEncounter.observations.forEach(o => {
            let copy = JSON.parse(JSON.stringify(o.raw));
            this.submitFhirObservations.push(copy);
            this.submitFhirPending.push({before: o.raw, after: copy});
        });
        let resourceObservationMap = {};
        map.mapping.forEach(m => {
            if (m.resource === 'Observation' && !Array.isArray(resourceObservationMap[m.resourceSystem + ' ' + m.resourceCode])) {
                if (m.resourceSystem + ' ' + m.resourceCode === '*')
                    resourceObservationMap[m.resourceSystem + ' ' + m.resourceCode] = this.submitFhirObservations;
                else {
                    resourceObservationMap[m.resourceSystem + ' ' + m.resourceCode] = this.submitFhirObservations.filter(
                        o => o.code.coding.filter(
                            c => c.system === m.resourceSystem && c.code === m.resourceCode
                        ).length > 0
                    );
                    if (resourceObservationMap[m.resourceSystem + ' ' + m.resourceCode].length === 0) {
                        let observation = NativeRenderStandaloneComponent.newObjservationGet(this.selectedEncounter);
                        resourceObservationMap[m.resourceSystem + ' ' + m.resourceCode].push(observation);
                        this.submitFhirObservations.push(observation);
                        this.submitFhirPending.push({before: null, after: observation});
                    }
                }
            }
        });

        // update observations
        let patient = this.patient;
        let encounter = this.selectedEncounter;
        map.mapping.forEach(m => {
            if (m.resource === 'Observation' && m.outFn && resourceObservationMap[m.resourceSystem + ' ' + m.resourceCode]) {
                resourceObservationMap[m.resourceSystem + ' ' + m.resourceCode].forEach(o => {
                    /* tslint:disable */ let resFn = eval('(' + m.resourceObj + ')'); /* tslint:enable */
                    /* tslint:disable */ let outFn = eval('(' + m.outFn + ')'); /* tslint:enable */
                    resFn(o)[m.resourceProperty] = outFn(this.elt);
                });
            }
        });

        // identify changed and submit to server
        for (let i = 0; i < this.submitFhirPending.length; i++) {
            let p = this.submitFhirPending[i];
            if (p.before && this.getObservationValue(p.before) === this.getObservationValue(p.after)) {
                this.submitFhirPending.splice(i, 1);
                i--;
            }
        }
        // TODO: refresh before copy from server and compare again
        this.submitFhirPending.forEach(p => {
            if (p.before)
                this.smart.api.update({type: p.after.resourceType, data: JSON.stringify(p.after), id: p.after.id})
                    .then(response => {
                        console.log(response);
                    });
            else
                this.smart.patient.api.create({
                    baseUrl: 'https://sb-fhir-stu3.smarthealthit.org/smartstu3/data/',
                    type: "Observation",
                    data: JSON.stringify(p.after)
                }).then(response => {
                    console.log(response);
                });
        });
    }
}
