import { HttpClient } from '@angular/common/http';
import { Component, Inject, Injectable } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import async_apply from 'async/apply';
import async_forEach from 'async/forEach';
import async_memoize from 'async/memoize';
import async_series from 'async/series';
import async_some from 'async/some';
import diff from 'deep-diff';
import _intersectionWith from 'lodash/intersectionWith';
import _noop from 'lodash/noop';
import _uniq from 'lodash/uniq';

import { propertyToQuestion, questionToProperty, staticToProperty } from '_fhirApp/properties';
import { ResourceTree } from '_fhirApp/resourceTree';
import { addEmptyNode, compareCodingId, resourceMap } from '_fhirApp/resources';
import { FhirSmartService } from '_fhirApp/fhirSmart.service';
import { valueSets } from '_fhirApp/valueSets';
import { CdeId, PermissibleValue, supportedFhirResources, supportedFhirResourcesArray } from 'shared/models.model';
import { CdeForm, FhirApp, FormElement, FormQuestion } from 'shared/form/form.model';
import { getIds, getMapToFhirResource } from 'shared/form/formAndFe';
import { iterateFe, iterateFeSync, questionAnswered, noopIterCb, findQuestionByTinyId } from 'shared/form/formShared';
import { codeSystemOut } from 'shared/mapping/fhir';
import {
    FhirDomainResource, FhirEncounter, FhirObservation, FhirObservationComponent, FhirProcedure
} from 'shared/mapping/fhir/fhirResource.model';
import { newCodeableConcept, reduce as reduceConcept } from 'shared/mapping/fhir/datatype/fhirCodeableConcept';
import { newCoding } from 'shared/mapping/fhir/datatype/fhirCoding';
import { typedValueToValue, valuedElementToItemType } from 'shared/mapping/fhir/from/datatypeFromItemType';
import { observationComponentFromForm, observationFromForm } from 'shared/mapping/fhir/resource/fhirObservation';
import { newProcedure } from 'shared/mapping/fhir/resource/fhirProcedure';
import { questionValueToFhirValue } from 'shared/mapping/fhir/to/datatypeToItemType';
import { deepCopy, reduceOptionalArray } from 'shared/system/util';

function applyCodeMapping(fhirApp, ids: (CdeId | PermissibleValue)[], systemProp: string, codeProp: string): void {
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

function isSupportedParentType(self, parent) {
    switch (self.resourceType) {
        case 'Observation':
        case 'Procedure':
            return ['bundle', 'Encounter'].indexOf(parent.resourceType) > -1;
    }
}

function resourceCodeableConceptMatch(resources, transform, ids) {
    let found;
    resources.some(r => {
        if (codeableConceptMatch(transform(r), ids)) {
            found = r;
            return true;
        }
    });
    return found;
}

function codeableConceptMatch(codeableConceptArray, ids) {
    return codeableConceptArray.some(code => !!_intersectionWith(code.coding, ids, compareCodingId).length);
}

type PatientForm = {
    form: CdeForm,
    name: string,
    observed?: number,
    percent?: number,
    resourceType: supportedFhirResources,
    tinyId: string,
    total?: number,
};

@Injectable()
export class CdeFhirService {
    getDisplayFunc = this.getDisplay.bind(this);
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
    patientForms: PatientForm[] = [];
    renderedPatientForm?: PatientForm;
    renderedResourceTree?: ResourceTree;

    constructor(public dialog: MatDialog,
                public fhirData: FhirSmartService,
                private http: HttpClient) {
    }

    async createObservation(self, q) {
        let observationPromise = observationFromForm(q, this.getDisplayFunc, this.fhirData.context, this.fhirData.patient);
        ResourceTree.setResource(self, null, observationPromise);
        let resource = await observationPromise;
        ResourceTree.setResource(self, null, resource);
        return resource;
    }

    async createObservationComponent(parent, self, q) {
        let componentPromise = observationComponentFromForm(q, this.getDisplayFunc);
        ResourceTree.setResourceNonFhir(self, componentPromise, 'component');
        let resource: FhirObservationComponent = await componentPromise;
        ResourceTree.setResourceNonFhir(self, resource, 'component');
        if (!Array.isArray(parent.resource.component)) {
            parent.resource.component = [];
        }
        parent.resource.component.push(resource);
        return resource;
    }

    createProcedure(parent) {
        let procedure = newProcedure(this.fhirData.context, this.fhirData.patient);
        ResourceTree.setResource(parent, null, procedure);
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

    // cb(string[]|undefined)
    getObservationCategory(system, code, cb) {
        this.lookupObservationCategories(system + ' : ' + code, (err, categories) => cb(err ? undefined : categories));
    }

    // cb(err)
    init(snapshot, cb) {
        this.http.get<FhirApp>('/fhirApp/' + snapshot.paramMap.get('config')).subscribe(fhirApp => {
            if (!fhirApp || !fhirApp.dataEndpointUrl || !fhirApp.clientId) {
                cb('Application not setup correctly.');
                return;
            }
            if (snapshot.queryParams['state']) {
                this.fhirData.init();
            } else if (snapshot.queryParams['iss']) {
                FhirSmartService.authorize(fhirApp.clientId, snapshot.paramMap.get('config'));
            }
            this.fhirData.baseUrl = fhirApp.dataEndpointUrl;
            fhirApp.forms.forEach(f => {
                this.http.get<CdeForm>('/form/' + f.tinyId).subscribe(form => {
                    CdeForm.validate(form);
                    let patientForm: PatientForm = {
                        tinyId: form.tinyId,
                        name: form.designations[0].designation,
                        form: form,
                        resourceType: getMapToFhirResource(form),
                    };
                    this.patientForms.push(patientForm);
                    iterateFeSync(form,
                        f => {
                            f.inForm.form.ids.push(new CdeId('NLM', f.inForm.form.tinyId));
                        },
                        undefined,
                        q => {
                            q.question.cde.ids.push(new CdeId('NLM', q.question.cde.tinyId));
                            applyCodeMapping(fhirApp, q.question.cde.ids, 'source', 'id');
                            q.question.cde.ids.forEach(id => {
                                this.getDisplay(id.source, id.id);
                            });
                            applyCodeMapping(fhirApp, q.question.answers, 'codeSystemName',
                                'permissibleValue');
                            applyCodeMapping(fhirApp, q.question.cde.permissibleValues, 'codeSystemName',
                                'permissibleValue');
                        }
                    );
                    cb();
                }, cb);
            });
        }, cb);
    }

    // cb()
    loadFormData(patientForm: PatientForm, cb = _noop) {
        this.renderedPatientForm = patientForm;
        this.renderedResourceTree = new ResourceTree(undefined, deepCopy(patientForm.form));
        this.read(this.renderedResourceTree)
            .then(() => this.updateProgress(this.renderedPatientForm, this.renderedResourceTree.crossReference))
            .then(cb);
    }

    async read(tree: ResourceTree): Promise<void> {
        if (getMapToFhirResource(tree.crossReference)) {
            await this.readResource(tree, tree);
        }
        return new Promise<void>((resolve, reject) => {
            iterateFe(tree.crossReference,
                async (f, cb, options) => {
                    let parent = await options.return;
                    let self = addEmptyNode(f, _noop, parent);
                    let retOptions = {return: parent};
                    if (getMapToFhirResource(f)) { // self !== parent
                        await this.readResource(parent, self);
                        retOptions.return = self;
                    }
                    // else do not use form
                    cb(undefined, retOptions);
                },
                noopIterCb,
                async (q, cb, options) => {
                    let parent = await options.return;
                    let self = addEmptyNode(q, _noop, parent);
                    let retOptions = {return: parent};
                    if (getMapToFhirResource(q)) { // self !== parent
                        await this.readResource(parent, self);
                        CdeFhirService.readQuestion(self);
                        retOptions.return = self;
                    } else if (self.parentAttribute) { // self !== parent
                        CdeFhirService.readQuestionProperty(parent, self, q);
                        retOptions.return = self;
                    }
                    // else do not use question
                    cb(undefined, retOptions);
                },
                err => {
                    if (err) reject();
                    else resolve();
                },
                {return: tree}
            );
        });
    }

    async readAgain(parent: ResourceTree, self: ResourceTree): Promise<void> {
        if (self.resource && self.resource.resourceType) {
            await this.readResource(parent, self);
            if (self.crossReference.elementType === 'question') {
                CdeFhirService.readQuestion(self);
            }
        } else if (self.parentAttribute) {
            CdeFhirService.readQuestionProperty(parent, self, self.crossReference);
        }
        return Promise.all(self.children.map(c => this.readAgain(self, c)))
            .then(() => {
                return;
            });
    }

    static readQuestion(self: ResourceTree) {
        if (self.resource && self.resource.resourceType === 'Observation') {
            if (self.resource.component) {
                throw new Error('BAD');
            }
            typedValueToValue(self.crossReference.question, valuedElementToItemType(self.resource), self.resource);
        }
    }

    static readQuestionProperty(parent: ResourceTree, self: ResourceTree, q: FormQuestion) {
        if (parent.resource) {
            switch (parent.resourceType) {
                case 'Observation':
                    if (self.resourceType === 'Observation') {
                        throw new Error('BAD');
                    } else if (parent.resourceType === 'Observation' && self.parentAttribute === 'component') {
                        let found: FhirObservationComponent = resourceCodeableConceptMatch(parent.resource.component,
                            r => [r.code], q.question.cde.ids);
                        if (found) {
                            typedValueToValue(q.question, valuedElementToItemType(found), found);
                            ResourceTree.setResourceNonFhir(self, found, 'component');
                        }
                    }
                    break;
                case 'Procedure':
                    if (propertyToQuestion(q, parent, self.parentAttribute)) {
                        ResourceTree.setResourceNonFhir(self, parent.resource[self.parentAttribute], self.parentAttribute);
                    }
                    break;
                default:
                    throw new Error('BAD');
            }
        }
    }

    // set resource if found
    async readResource(parent: ResourceTree, self: ResourceTree): Promise<ResourceTree> {
        // the following functions call ResourceTree.setResource(self, resource)
        if (await this.readResourceById(self)) {
            return self;
        }
        // TODO: implement
        // if (await this.readResourceByIdentifier(parent, self)) {
        //     return self;
        // }
        if (await this.readResourceByCode(parent, self)) {
            return self;
        }
        return self;
    }

    readResourceByCode(parent: ResourceTree, self: ResourceTree): Promise<ResourceTree> {
        let f: CdeForm|FormElement = self.crossReference;
        let procedureMapping = self.map ? self.map.mapping : undefined;
        switch (self.resourceType) {
            case 'Observation':
                return new Promise<ResourceTree>((resolve, reject) => {
                    let observation: FhirObservation;
                    async_some(getIds(f), (id, done) => {
                        return this.fhirData.search<FhirObservation>('Observation',
                            {code: (id.source ? codeSystemOut(id.source) + '|' : '') + id.id})
                            .then(r => this.selectOne('edit', r))
                            .then(r => {
                                if (r) {
                                    observation = r;
                                    done(undefined, true);
                                } else {
                                    done(undefined, false);
                                }
                            }, done);
                    }, err => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        if (observation) {
                            ResourceTree.setResource(self, observation);
                        }
                        resolve(self);
                    });
                });
            case 'Procedure':
                if (procedureMapping) {
                    if (procedureMapping.procedureQuestionID === 'static') {
                        if (procedureMapping.procedureCode) {
                            return this.fhirData.search<FhirProcedure>('Procedure',
                                {code: (procedureMapping.procedureCodeSystem || 'SNOMED') + '|' + procedureMapping.procedureCode})
                                .then(r => this.selectOne('edit', r))
                                .then(r => {
                                    if (r) ResourceTree.setResource(self, r);
                                    return self;
                                });
                        }
                    } else {
                        if (procedureMapping.procedureQuestionID) {
                            let q = findQuestionByTinyId(procedureMapping.procedureQuestionID, self.crossReference);
                            if (q && q.question.answers.length) {
                                let procedures: FhirProcedure[] = [];
                                let subtype = self.map.questionProperties
                                    .filter(p => p.property === 'code')
                                    .map((p: any) => p.subTypes[0])[0];
                                return Promise.all(q.question.answers.map(a => {
                                    return this.fhirData.search<FhirProcedure>('Procedure',
                                        {code: codeSystemOut(a.codeSystemName || subtype || 'SNOMED') + '|' + a.permissibleValue})
                                        .then(r => {
                                            procedures = procedures.concat(r);
                                            return;
                                        });
                                }))
                                    .then(() => this.selectOne('edit', procedures))
                                    .then(r => {
                                        if (r) ResourceTree.setResource(self, r);
                                        return self;
                                    });
                            }
                        }
                    }
                }
                break;
            default:
                throw new Error('BAD');
        }
    }

    readResourceById(self): Promise<ResourceTree> {
        if (!self.resource || !self.resource.id || !self.resource.resourceType) {
            return Promise.resolve(undefined);
        }
        return this.fhirData.search(self.resource.resourceType, {_id: self.resource.id})
            .then(r => this.selectOne('edit', r))
            .then(r => {
                if (r) ResourceTree.setResource(self, r);
                return self;
            });
    }

    // readResourceByCode(parent, self, f) {
    //     // query observations and procedures for codes array with application filters
    //     if (supportedFhirResourcesArray.indexOf(self.resourceType) > -1 && this.isSupportedParentType(self, parent)) {
    //         if (!self.resource) {
    //             let ids = getIds(f); // q.question.cde.ids
    //             let resources;
    //             let transform;
    //             switch (self.resourceType) {
    //                 case 'Observation':
    //                     resources = observations;
    //                     transform = r => [r.code];
    //                     break;
    //                 case 'Procedure':
    //                     resources = procedures;
    //                     transform = r => r ? [r] : [];
    //             }
    //             let found = this.resourceCodeableConceptMatch(resources, transform, ids);
    //             if (found) {
    //                 ResourceTree.setResource(self, found);
    //             }
    //         }
    //     } else {
    //         throw new Error('BAD');
    //     }
    //     return self;
    // }

    save(resource: FhirDomainResource): Promise<FhirDomainResource> {
        return new Promise<FhirDomainResource>(resolve => {
            if (resource.resourceType === 'Observation') { // has category
                // fill in category from database config
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
                    resolve(resource);
                });
            } else if (resource.resourceType === 'Procedure') {
                resolve(resource);
            }
        }).then(this.fhirData.save.bind(this.fhirData));
    }

    // cb(err)
    saveTree(node: ResourceTree, cb) {
        async_series([
            done => this.saveTreeNode(node, done),
            async_apply(async_forEach, node.children, this.saveTree.bind(this))
        ], cb);
    }

    // cb(err, resource)
    saveTreeNode(node: ResourceTree, cb) {
        if (node.resourceType && node.resource && (node.resourceRemote === null || node.resourceRemote
            && diff(node.resourceRemote, node.resource))) {
            if (node.resourceRemote && !node.resource.id) {
                throw new Error('Error: ResourceTree bad state');
            }
            // // save Device then Observation
            // if (node.resource.device && node.resource.device.indexOf('Device/new') > -1) {
            //     let device = devices[parseInt(p.after.device.slice(10))];
            //     service.save(device).then(device => {
            //         node.resource.device = asRefString(device);
            //         save(node, done);
            //     }, done);
            // } else
            this.save(node.resource).then(resource => {
                ResourceTree.setResource(node, resource);
                cb(undefined, resource);
            }, cb);
        } else {
            cb();
        }
    }

    selectEncounter() {
        this.fhirData.search<FhirEncounter>('Encounter', {})
            .then(r => this.selectOne('filter', r))
            .then(r => {
                this.fhirData.context = r;
            });
    }

    selectOne<T>(type: 'filter'|'edit', resources: T[]): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const dialogRef = this.dialog.open(SelectOneDialogComponent, {
                data: {resources, type}
            });
            dialogRef.afterClosed().subscribe(result => {
                resolve(result);
            });
        });
    }

    selectPatient() {
        this.fhirData.searchAll('Patient', {})
            .then(r => this.selectOne('filter', r))
            .then(r => {
                if (r) {
                    this.fhirData.patient = r;
                }
            });
    }

    submit(cb) {
        this.write(this.renderedResourceTree, this.renderedResourceTree).then(() => {
            this.saveTree(this.renderedResourceTree, err => {
                if (err) {
                    cb(err);
                    return;
                }
                this.readAgain(this.renderedResourceTree, this.renderedResourceTree)
                    .then(() => this.updateProgress(this.renderedPatientForm, this.renderedResourceTree.crossReference))
                    .then(cb);
            });
        });
    }

    async write(parent: ResourceTree, self: ResourceTree): Promise<void> {
        if (self.crossReference.elementType === 'question') {
            await parent.resource;
            const q = self.crossReference;
            if (supportedFhirResourcesArray.indexOf(self.resourceType) > -1 && isSupportedParentType(self, parent)) {
                await this.writeResourceQuestion(self, q);
            } else if (supportedFhirResourcesArray.indexOf(parent.resourceType) > -1 && self.parentAttribute
                && (!resourceMap[parent.resourceType] || parent.map)) {
                await this.writeResourceQuestion(self, q, parent);
            } else {
                if (parent !== self) {
                    throw new Error('Error: not supported FHIR relationship: parent ' + parent.resourceType
                        + ', child ' + self.resourceType + '.');
                }
            }
        }
        return Promise.all(self.children.map(c => this.write(self, c)))
            .then(() => {
                if (ResourceTree.isResource(self)) {
                    staticToProperty(self);
                }
                return;
            });
    }

    async writeResourceQuestion(self, q, parent?: ResourceTree) {
        if (!self.resource && questionAnswered(q)) {
            switch (parent ? parent.resourceType : self.resourceType) {
                case 'Observation':
                    if (parent) { // 'component' property is the only one supported
                        if (!parent.resource) {
                            await this.createObservation(parent, parent.crossReference);
                        }
                        let found = resourceCodeableConceptMatch(parent.resource.component, r => [r.code], q.question.cde.ids);
                        if (found) {
                            ResourceTree.setResourceNonFhir(self, found, 'component');
                        } else {
                            await this.createObservationComponent(parent, self, q);
                        }
                    } else {
                        await this.createObservation(self, q);
                    }
                    break;
                case 'Procedure':
                    if (!parent) {
                        throw new Error('BAD');
                    }
                    if (!parent.resource) {
                        this.createProcedure(parent);
                    }
                    break;
                default:
                    throw new Error('BAD');
            }
        }
        switch (parent ? parent.resourceType : self.resourceType) {
            case 'Observation':
                if (self.resource) {
                    questionValueToFhirValue(q, self.resource, true);
                }
                break;
            case 'Procedure':
                if (self.resource || questionAnswered(q)) { // creates/deletes the property object
                    questionToProperty(q, parent, self.parentAttribute);
                }
                break;
            default:
                throw new Error('BAD');
        }
    }

    updateProgress(f: PatientForm, form: CdeForm) {
        f.observed = 0;
        f.total = 0;
        f.percent = 0;
        iterateFeSync(form, undefined, undefined, q => {
            f.total++;
            if (questionAnswered(q)) {
                f.observed++;
            }
        });
        f.percent = 100 * f.observed / f.total;
    }
}

@Component({
    template: `
        <h2 mat-dialog-title>Select One {{data.resources[0]?.resourceType}}:</h2>
        <div mat-dialog-content>
            <div *ngFor="let resource of data.resources" class="m-1">
                <button mat-raised-button color="primary"
                        [mat-dialog-close]="resource">Select</button>{{resource.id}}
            </div>
            <div *ngIf="data.resources.length === 10" style="text-align: center">... (more)</div>
        </div>
        <div mat-dialog-actions>
            <button mat-raised-button color="basic" mat-dialog-close cdkFocusInitial>{{data.type==='filter'?'None':'New'}}</button>
        </div>
    `,
})
export class SelectOneDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: {resources, type}) {}
}
