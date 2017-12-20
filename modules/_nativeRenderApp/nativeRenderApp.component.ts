import { Component } from "@angular/core";
import { Http } from '@angular/http';
import * as async from "async";
import * as moment from 'moment';
import "rxjs/add/operator/map";
import "rxjs/Observable";
import "fhirclient";
import { mappings } from "./fhirMapping";
import { FormService } from 'nativeRender/form.service';

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
        .addbtn  {
            background-color: #61c200;
            color: white;
            margin-left: 0;
            padding: 4px 8px 2px 8px;
            vertical-align: baseline;
        }
    `],
    templateUrl: "./nativeRenderApp.component.html"
})
export class NativeRenderAppComponent {
    elt: any;
    errorMessage: string;
    methodLoadForm = this.loadForm.bind(this);
    newEncounter = false;
    newEncounterDate: string;
    newEncounterErrorMessage: string;
    newEncounterReason: string;
    newEncounterType: string = 'Outpatient Encounter';
    newEncounterValid = false;
    panelType: string;
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
    selectedProfile: string;
    showData = false;
    smart;
    submitForm: boolean;
    summary = false;
    static externalCodeSystems = [
        {id: 'LOINC', uri: 'http://loinc.org'},
        {id: 'UNITS', uri: 'http://unitsofmeasure.org/'},
    ];
    static externalCodesDetail = {
        LOINC: {
            '18262-6': 'Low Density Lipoprotein Cholesterol',
            '2085-9': 'High Density Lipoprotein Cholesterol',
            '2093-3': 'Total Cholesterol',
            '2571-8': 'Triglycerides',
            '29463-7': 'Body Weight',
            '39156-5': 'Body Mass Index',
            '55284-4': 'Blood Pressure',
            '8302-2': 'Body Height',
            '8462-4': 'Diastolic Blood Pressure',
            '8480-6': 'Systolic Blood Pressure'
        }
    };
    static fhirObservations = {
        'LOINC 18262-6': {categoryCode: 'laboratory'},
        'LOINC 2085-9': {categoryCode: 'laboratory'},
        'LOINC 2093-3': {categoryCode: 'laboratory'},
        'LOINC 2571-8': {categoryCode: 'laboratory'},
        'LOINC 29463-7': {categoryCode: 'vital-signs'},
        'LOINC 39156-5': {categoryCode: 'vital-signs'},
        'LOINC 55284-4': {categoryCode: 'vital-signs'},
        'LOINC 8302-2': {categoryCode: 'vital-signs'}
    };
    static readonly isTime = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[+-][0-9]{2}:[0-9]{2}$/;

    constructor(private http: Http, private formService: FormService) {
        let args: any = NativeRenderAppComponent.searchParamsGet();
        this.selectedProfile = args.selectedProfile;
        this.submitForm = args.submit !== undefined;
        this.panelType = args.panelType;

        if ((<any>window).formElt) {
            let elt = JSON.parse(JSON.stringify((<any>window).formElt));
            this.loadForm(null, elt);
        } else {
            if (args.tinyId)
                this.getForm(args.tinyId, this.methodLoadForm);
            else
                this.summary = true;

            if (args.state)
                this.loadFhir();
            else if (args.iss)
                (<any>window).FHIR.oauth2.authorize({
                    "client_id": "7d291805-3ec8-42a5-ba7d-bb7ef1558c71",
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
        if (!this.selectedEncounter)
            return;

        this.updateProgress();
    }

    filterObservations() {
        this.selectedObservations = this.selectedEncounter
            ? this.selectedEncounter.observations : this.patientObservations;
    }

    static getCoding(system, code) {
        let text = this.getCodeDisplay(system, code);
        return {
            coding: [{
                system: this.getCodeSystemOut(system),
                code: code,
                display: text
            }],
            text: text
        };
    }

    static getCodingsPreview(coding) {
        return coding.reduce(
            (a, v) => a += v.display + ' ' + this.getCodeSystem(v.system) + ':' + v.code + '\n', ''
        );
    }

    static getCodeDisplay(system, code) {
        return this.externalCodesDetail[system][code];
    }

    static getCodeSystem(uri) {
        let results = this.externalCodeSystems.filter(c => c.uri === uri);
        if (results.length)
            return results[0].id;
        else
            return 'unknown';
    }

    static getCodeSystemOut(system, fe = null) {
        let s = system;
        if (fe && fe.question && fe.question.cde && Array.isArray(fe.question.cde.ids) && fe.question.cde.ids.length)
            s = fe.question.cde.ids[0].source;

        let external = this.externalCodeSystems.filter(e => e.id === s);
        if (external.length)
            return external[0].uri;
        else
            return s;
    }

    getForm(tinyId, cb) {
        this.http.get('/form/' + tinyId).map(res => res.json()).subscribe(elt => {
            cb(null, elt);
        }, (err) => {
            cb(err.statusText);
        });
    }

    static getFormMap(tinyId) {
        let maps = mappings.filter(m => m.form === tinyId
            && m.type === 'external'
            && m.system === 'http://hl7.org/fhir'
            && m.code === '*'
            && m.format === 'json'
        );
        if (maps.length)
            return maps[0];
        else
            return null;
    }

    getFormObservations(tinyId, cb) {
        function pushFormObservationNames(tinyId) {
            let map = NativeRenderAppComponent.getFormMap(tinyId);
            map && map.mapping.forEach(m => {
                let key = m.resourceSystem + ' ' + m.resourceCode;
                if (m.resource === 'Observation' && !resourceObservationMap[key] && m.resourceCode !== '*') {
                    resourceObservationMap[key] = true;
                    observationNames.push(NativeRenderAppComponent.getCodeSystemOut(m.resourceSystem)
                        + ' ' + m.resourceCode);
                }
            });
        }

        let resourceObservationMap = {};
        let observationNames = [];
        pushFormObservationNames(tinyId);
        this.getForm(tinyId, (err, elt) => {
            if (!err && elt)
                FormService.iterateFeSync(elt, form => pushFormObservationNames(form.inForm.form.tinyId));
            cb(err, observationNames);
        });
    }

    static getObservationValue(observation) {
        if (!observation)
            return undefined;
        if (observation.valueCodeableConcept)
            return this.getCodingsPreview(observation.valueCodeableConcept.coding);
        else if (observation.valueQuantity) {
            let quantity = observation.valueQuantity;
            if (quantity.value === undefined)
                return undefined;
            return quantity.value + ' ' + quantity.code + '(' + this.getCodeSystem(quantity.system) + ')';
        } else if (observation.component) {
            let value = observation.component.reduce((a, v) => {
                let vs = this.getObservationValue(v);
                if (vs === undefined)
                    return a;
                return a + this.getCodingsPreview(v.code.coding) + ' = ' + vs + '\n';
            }, '');
            if (value === '')
                return undefined;
            else
                return value;
        } else
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
                            results.forEach(observation =>
                                this.patientObservations.push(NativeRenderAppComponent.observationAdd(observation))
                            );
                            cb();
                        });
                },
                cb => {
                    this.smart.patient.api.search({type: "Organization"})
                        .then((results, refs) => {
                            if (results && results.data && results.data.entry && results.data.entry.length)
                                this.patientOrganization = results.data.entry[0].resource;
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
        this.mapIO(form, this.selectedEncounter.observations.map(o => o.raw), 'in');
        FormService.iterateFeSync(form, this.loadFhirDataForm.bind(this));
    }

    loadForm(err = null, elt = null) {
        if (err) return this.errorMessage = "Sorry, we are unable to retrieve this element.";
        this.elt = elt;
        this.loadFhirData();
    }

    mapIO(form, observations, mode, createCb = null) {
        let map = NativeRenderAppComponent.getFormMap(form.tinyId ? form.tinyId : form.inForm.form.tinyId);

        if (map && mode === 'in') {
            /* tslint:disable */ let encounterFn = eval('(' + map.encounterFn + ')'); /* tslint:enable */
            if (encounterFn)
                encounterFn(form, this.selectedEncounter);
        }

        let resourceObservationMap = {};
        map && map.mapping.forEach(m => {
            let key = m.resourceSystem + ' ' + m.resourceCode;
            if (m.resource === 'Observation' && !Array.isArray(resourceObservationMap[key])) {
                if (m.resourceCode === '*')
                    resourceObservationMap[key] = observations;
                else {
                    let system = NativeRenderAppComponent.getCodeSystemOut(m.resourceSystem);
                    resourceObservationMap[key] = observations.filter(
                        o => o.code.coding.some(
                            c => c.system === system && c.code === m.resourceCode
                        )
                    );
                    if (createCb && resourceObservationMap[key].length === 0) {
                        let filtered = map.mapping
                            .filter(mo => mo.resourceComponentSystem && mo.resourceComponentCode
                                && mo.resourceSystem === m.resourceSystem && mo.resourceCode === m.resourceCode)
                            .map(mo => [
                                mo.resourceComponentSystem + ' ' + mo.resourceComponentCode,
                                {system: mo.resourceComponentSystem, code: mo.resourceComponentCode}
                            ]);
                        let components = Array.from((new Map(filtered)).values());
                        resourceObservationMap[key].push(
                            createCb({system: m.resourceSystem, code: m.resourceCode}, components));
                    }
                }
            }
        });

        // update observations
        let patient = this.patient;
        let encounter = this.selectedEncounter;
        function parseDateTime(fe) {
            let m = moment(fe.question.answer);
            if (m.isValid()) {
                fe.question.answerDate = {year: m.year(), month: m.month() + 1, day: m.date()};
                fe.question.answerTime = {hour: m.hour(), minute: m.minute(), second: m.second()};
            }
        }
        function getValueQuantity(fe, uomSystem, uomCode = null, feUom = null) {
            return {
                value: fe.question.answer,
                unit: fe.question.answerUom || feUom && feUom.question.answer || uomCode,
                system: NativeRenderAppComponent.getCodeSystemOut(uomSystem),
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
        map && map.mapping.forEach(m => {
            function getByCode(form, instance = 0, system = null, code = null) {
                if (!system)
                    system = m.resourceSystem;
                if (!code)
                    code = m.resourceCode;
                let count = -1;
                let result = null;
                function getByCodeRecurse(fe) {
                    fe.formElements.forEach(f => {
                        if (f.elementType === 'section')
                            getByCodeRecurse(f);
                        else if (f.elementType === 'form') {
                            if (f.inForm.form.ids.filter(
                                id => id.source === system && id.id === code).length
                            ) {
                                count++;
                                if (count >= instance)
                                    return result = f;
                            }
                            getByCodeRecurse(f);
                        } else {
                            if (f.question.cde.ids.filter(
                                id => id.source === system && id.id === code).length
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
                return getByCode(getByCode(form), 0, m.resourceComponentSystem, m.resourceComponentCode);
            }
            function getComponent(res) {
                let system = NativeRenderAppComponent.getCodeSystemOut(m.resourceComponentSystem);
                let code = m.resourceComponentCode;
                if (res.component) {
                    let components = res.component.filter(comp => comp.code.coding.some(
                        c => c.system === system && c.code === code
                    ));
                    if (components.length)
                        return components[0];
                    else
                        return null;
                } else {
                    res.component = {};
                    return res.component;
                }
            }
            let key = m.resourceSystem + ' ' + m.resourceCode;
            if (m.resource === 'Observation' && resourceObservationMap[key]
                && (mode === 'in' && m.inFn || mode === 'out' && m.outFn)) {
                resourceObservationMap[key].forEach(o => {
                    /* tslint:disable */ let resFn = eval('(' + m.resourcePropertyObj + ')'); /* tslint:enable */
                    if (!resFn)
                        resFn = obj => obj;

                    if (mode === 'in') {
                        /* tslint:disable */ let inFn = eval('(' + m.inFn + ')'); /* tslint:enable */
                        if (inFn)
                            inFn(form, resFn(o)[m.resourceProperty]);
                    } else if (mode === 'out') {
                        /* tslint:disable */ let outFn = eval('(' + m.outFn + ')'); /* tslint:enable */
                        if (outFn)
                            resFn(o)[m.resourceProperty] = outFn(form);
                    }
                });
            }
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
        let encounter = {
            "resourceType": "Encounter",
            "id": null,
            "status": "finished",
            "class": {"code": "outpatient"},
            "type": [{"coding": [{"system": "http://snomed.info/sct", "code": "185349003"}], "text": "Outpatient Encounter"}],
            "period": {"start": null, "end": null},
            "serviceProvider": {
                "reference": null
            },
            "subject": {
                "reference": null
            }
        };
        encounter.period.start = encounter.period.end = this.newEncounterDate;
        encounter.subject.reference = 'Patient/' + this.patient.id;
        if (this.patientOrganization)
            encounter.serviceProvider.reference = 'Organization/' + this.patientOrganization.id;
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
        } else if (!NativeRenderAppComponent.isTime.exec(this.newEncounterDate)) {
            this.newEncounterErrorMessage = 'Error: Invalid date format. Needs to be in format YYYY-MM-DDTHH:MM:SS-HH:MM';
            this.newEncounterValid = false;
        } else {
            this.newEncounterErrorMessage = '';
            this.newEncounterValid = true;
        }
    }

    static newObservationGet(): any {
        return {
            "resourceType": "Observation",
            "id": null,
            "status": "final",
            "category": [],
            "code": null,
            "subject": {
                "reference": null
            },
            "context": {
                "reference": null
            },
            "effectiveDateTime": null,
            "issued": null
        };
    }

    static observationAdd(observation) {
        return {
            code: observation.code
                ? this.getCodingsPreview(observation.code.coding)
                : JSON.stringify(observation),
            value: this.getObservationValue(observation),
            date: observation.issued,
            encounter: observation.context.reference,
            raw: observation
        };
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
        let submitFhirPending = [];
        let submitFhirObservations = [];
        this.selectedEncounter.observations.forEach(o => {
            let copy = JSON.parse(JSON.stringify(o.raw));
            submitFhirObservations.push(copy);
            submitFhirPending.push({before: o.raw, after: copy});
        });

        let createFn = (obsCode = null, compCodes = []) => {
            let observation = NativeRenderAppComponent.newObservationGet();
            observation.context.reference = 'Encounter/' + this.selectedEncounter.raw.id;
            observation.issued = this.selectedEncounter.date;
            observation.subject.reference = 'Patient/' + this.patient.id;
            if (obsCode)
                observation.code = NativeRenderAppComponent.getCoding(obsCode.system, obsCode.code);
            if (compCodes.length) {
                observation.component = [];
                compCodes.forEach(c => {
                    observation.component.push({code: NativeRenderAppComponent.getCoding(c.system, c.code)});
                });
            }
            let category = NativeRenderAppComponent.fhirObservations[obsCode.system + ' ' + obsCode.code];
            if (category)
                observation.category.push({
                    "coding": [{
                        "system": "http://hl7.org/fhir/observation-category",
                        "code": category.categoryCode
                    }]
                });

            submitFhirObservations.push(observation);
            submitFhirPending.push({before: null, after: observation});
            return observation;
        };
        let outputMapIO = (elt) => {
            this.mapIO(elt, submitFhirObservations, 'out', createFn);
        };
        outputMapIO(this.elt);
        FormService.iterateFeSync(this.elt, outputMapIO);

        // identify changed and submit to server
        for (let i = 0; i < submitFhirPending.length; i++) {
            let p = submitFhirPending[i];
            if (NativeRenderAppComponent.getObservationValue(p.before)
                === NativeRenderAppComponent.getObservationValue(p.after)) {
                submitFhirPending.splice(i, 1);
                i--;
            }
        }
        // TODO: refresh before copy from server and compare again to prevent save with conflict
        async.forEach(submitFhirPending, (p, done) => {
            if (p.before)
                this.smart.api.update({
                    data: JSON.stringify(p.after),
                    id: p.after.id,
                    type: p.after.resourceType
                }).then(response => {
                    // let match = this.patientObservations.filter(o => o.raw === p.before);
                    // if (match.length) {
                    //     let index = this.patientObservations.indexOf(match[0]);
                    //     if (index > -1)
                    //         this.patientObservations[i] = response.data;
                    // }
                    if (!response || !response.data)
                        return done('Not saved ' + p.after.id);
                    let obs = NativeRenderAppComponent.observationAdd(response.data);
                    let index = this.patientObservations.findIndex(o => o.raw === p.before);
                    if (index > -1)
                        this.patientObservations[index] = obs;
                    index = this.selectedEncounter.observations.findIndex(o => o.raw === p.before);
                    if (index > -1)
                        this.selectedEncounter.observations[index] = obs;
                    done();
                });
            else
                this.smart.patient.api.create({
                    baseUrl: 'https://sb-fhir-stu3.smarthealthit.org/smartstu3/data/',
                    data: JSON.stringify(p.after),
                    type: "Observation"
                }).then(response => {
                    if (!response || !response.data)
                        return done('Not saved ' + p.after.id);
                    let obs = NativeRenderAppComponent.observationAdd(response.data);
                    this.patientObservations.push(obs);
                    this.selectedEncounter.observations.push(obs);
                    done();
                });
        }, (err: string) => {
            if (err)
                this.saveMessage = err;
            else
                this.saveMessage = 'Saved.';
            setTimeout(() => this.saveMessage = null, 5000);

            this.loadFhirData();
            this.updateProgress();
        });
    }

    updateProgress() {
        this.patientForms.forEach(f => {
            if (f.tinyId)
                this.getFormObservations(f.tinyId, (err, names) => {
                    f.observed = this.selectedEncounter.observations.filter(
                        o => o.raw.code.coding.some(c => names.indexOf(c.system + ' ' + c.code) > -1)
                    ).length;
                    f.total = names.length;
                    f.percent = 100 * f.observed / f.total;
                });
            else {
                f.observed = 0;
                f.total = 0;
                f.percent = 0;
            }
        });
    }
}
