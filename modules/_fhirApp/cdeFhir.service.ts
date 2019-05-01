import { HttpClient } from '@angular/common/http';
import { Component, Inject, Injectable } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { ActivatedRouteSnapshot } from '@angular/router';
import { FhirAppViewModes } from '_fhirApp/fhirApp.component';
import { propertyToQuestion, questionToProperty, staticToProperty } from '_fhirApp/properties';
import {
    contextTypesArray,
    ResourceTree, ResourceTreeAttribute, ResourceTreeIntermediate, ResourceTreeResource, ResourceTreeRoot,
    ResourceTreeUtil
} from '_fhirApp/resourceTree';
import {
    addEmptyNode, addRootNode, compareCodingId, resourceMap, setResourceAndUpdateParentResource
} from '_fhirApp/resources';
import { FhirSmartService } from '_fhirApp/fhirSmart.service';
import { valueSets } from '_fhirApp/valueSets';
import async_forEach from 'async/forEach';
import async_memoize from 'async/memoize';
import async_series from 'async/series';
import async_some from 'async/some';
import { questionAnswered, findQuestionByTinyId, isQuestion } from 'core/form/fe';
import { getIds, getTinyId, getVersion } from 'core/form/formAndFe';
import diff from 'deep-diff';
import _intersectionWith from 'lodash/intersectionWith';
import _noop from 'lodash/noop';
import _uniq from 'lodash/uniq';
import {
    assertThrow, assertTrue, assertUnreachable, Cb, CbErr, CbRet, CbRet1, CdeId, PermissibleValue
} from 'shared/models.model';
import { CdeForm, FhirApp, FormQuestion } from 'shared/form/form.model';
import { iterateFe, iterateFeSync, questionMulti } from 'shared/form/fe';
import { codeSystemOut } from 'shared/mapping/fhir';
import { FhirCodeableConcept, FhirValue } from 'shared/mapping/fhir/fhir.model';
import {
    FhirDomainResource, FhirEncounter, FhirObservation, FhirObservationComponent, FhirProcedure, FhirQuestionnaire,
    FhirQuestionnaireResponse, FhirQuestionnaireResponseItem, supportedFhirResourcesArray
} from 'shared/mapping/fhir/fhirResource.model';
import { newCodeableConcept, reduce as reduceConcept } from 'shared/mapping/fhir/datatype/fhirCodeableConcept';
import { newCoding } from 'shared/mapping/fhir/datatype/fhirCoding';
import { typedValueToValue, valuedElementToItemType } from 'shared/mapping/fhir/from/datatypeFromItemType';
import { asRefString, toRef } from 'shared/mapping/fhir/datatype/fhirReference';
import { observationComponentFromForm, observationFromForm } from 'shared/mapping/fhir/resource/fhirObservation';
import { newProcedure } from 'shared/mapping/fhir/resource/fhirProcedure';
import {
    newQuestionnaireResponse, newQuestionnaireResponseItem
} from 'shared/mapping/fhir/resource/fhirQuestionnaireResponse';
import {
    containerToItemType,
    questionToFhirValue, storeTypedValue, valueToTypedValue
} from 'shared/mapping/fhir/to/datatypeToItemType';
import { formToQuestionnaire } from 'shared/mapping/fhir/to/toQuestionnaire';
import { deepCopy, reduceOptionalArray } from 'shared/system/util';
import { isArray } from 'util';

function isFhirObservation(resource: FhirDomainResource): resource is FhirObservation {
    return resource.resourceType === 'Observation';
}

function isFhirProcedure(resource: FhirDomainResource): resource is FhirProcedure {
    return resource.resourceType === 'Procedure';
}

function applyCodeMapping(fhirApp: FhirApp, ids: (CdeId|PermissibleValue)[], systemProp: string, codeProp: string): void {
    function highestPriority(ids: (CdeId|PermissibleValue)[], index: number) {
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
        return false;
    });

    fhirApp.mapping.forEach(m => {
        ids.some((id, index, ids) => {
            if ((id[systemProp] === m.cdeSystem || !id[systemProp] && !m.cdeSystem) && id[codeProp] === m.cdeCode) {
                id[systemProp] = m.fhirSystem;
                id[codeProp] = m.fhirCode;
                highestPriority(ids, index);
                return true;
            }
            return false;
        });
    });
}

function isSupportedResourceRelationship(self: ResourceTreeResource, parent?: ResourceTreeResource) {
    switch (self.resourceType) {
        case 'Observation':
        case 'Procedure':
        case 'QuestionnaireResponse':
            return !parent || ResourceTreeUtil.isResource(parent) && contextTypesArray.indexOf(parent.resourceType) > -1;
        default:
            assertUnreachable(self.resourceType);
    }
}

function resourceCodeableConceptMatch(resources: FhirDomainResource[], transform: CbRet<FhirCodeableConcept[], any>, ids: CdeId[]) {
    let found = undefined;
    resources.some(r => {
        if (codeableConceptMatch(transform(r), ids)) {
            found = r;
            return true;
        }
        return false;
    });
    return found;
}

function codeableConceptMatch(codeableConceptArray: FhirCodeableConcept[], ids: CdeId[]) {
    return codeableConceptArray.some(code => !!_intersectionWith(code.coding, ids, compareCodingId).length);
}

export type PatientForm = {
    form: CdeForm,
    name: string,
    observed: number,
    percent: number,
    tinyId: string,
    total: number,
};

@Injectable()
export class CdeFhirService {
    cleanupPatient!: Cb;
    getDisplayFunc = this.getDisplay.bind(this);
    lookupObservationCategories: (code: string, cb: CbErr) => void = async_memoize((code: string, done: CbErr<string>) => {
        this.http.get<{categories: 'social-history'|'vital-signs'|'imaging'|'laboratory'|'procedure'|'survey'|'exam'|'therapy'}>('/fhirObservationInfo?id=' + code).subscribe(r => {
            done(undefined, r ? r.categories : undefined);
        }, done);
    });
    lookupLoincName: (code: string, cb: CbErr) => void = async_memoize((code: string, done: CbErr<string[]>) => {
        this.http.get('/server/uts/umlsCuiFromSrc/' + code + '/LNC').subscribe((r: any) => {
            if (r && r.result && r.result.results.length) {
                done(undefined, r.result.results[0].name.split(':')[0]);
            }
        }, done);
    });
    patientForms: PatientForm[] = [];
    renderedPatientForm?: PatientForm;
    renderedResourceTree?: ResourceTreeRoot|ResourceTreeResource;

    constructor(public dialog: MatDialog,
                public fhirData: FhirSmartService,
                private http: HttpClient) {
    }

    async createParents(self: ResourceTree): Promise<void> {
        // setResource for all created
        if (self.resource) {
            return;
        }
        if (ResourceTreeUtil.isResource(self)) {
            let resource: FhirDomainResource;
            switch (self.root.resourceType) {
                case 'Observation':
                    let observationPromise = observationFromForm(self.crossReference, this.getDisplayFunc,
                        this.fhirData.context, this.fhirData.patient);
                    ResourceTreeUtil.setResource(self, null, observationPromise);
                    resource = await observationPromise;
                    break;
                case 'Procedure':
                    resource = newProcedure(this.fhirData.context, this.fhirData.patient);
                    break;
                case 'QuestionnaireResponse':
                    resource = newQuestionnaireResponse(this.fhirData.context, this.fhirData.patient, self.lookupResource);
                    break;
                default:
                    assertUnreachable(self.root.resourceType);
            }
            ResourceTreeUtil.setResource(self, null, resource!);
        } else {
            return this.createParents(self.parent).then(async () => {
                await self.parent.resource;
                if (self.resource) {
                    return;
                }
                if (ResourceTreeUtil.isIntermediate(self)) {
                    switch (self.root.resourceType) {
                        case 'Observation':
                        case 'Procedure':
                            break;
                        case 'QuestionnaireResponse':
                            setResourceAndUpdateParentResource(self, 'item', newQuestionnaireResponseItem(self.crossReference.feId));
                            break;
                        default:
                            assertUnreachable(self.root.resourceType);
                    }
                } else if (ResourceTreeUtil.isAttribute(self)) {
                    switch (self.root.resourceType) {
                        case 'Observation':
                            let componentPromise = observationComponentFromForm(self.crossReference, this.getDisplayFunc);
                            ResourceTreeUtil.setResource(self, componentPromise);
                            setResourceAndUpdateParentResource(self, 'component', await componentPromise);
                            break;
                        case 'Procedure':
                            break;
                        case 'QuestionnaireResponse':
                            setResourceAndUpdateParentResource(self, 'item', newQuestionnaireResponseItem(self.crossReference.feId));
                            break;
                        default:
                            assertUnreachable(self.root.resourceType);
                    }
                }
            });
        }
    }

    getDisplay(system?: string, code?: string): Promise<string | undefined> {
        if (code && system === 'LOINC') {
            return new Promise(resolve => {
                this.lookupLoincName(code, (err, data) => resolve(err ? undefined : data));
            });
        } else {
            return Promise.resolve(undefined);
        }
    }

    // cb(string[]|undefined)
    getObservationCategory(system: string, code: string, cb: CbErr) {
        this.lookupObservationCategories(system + ' : ' + code, (err, categories) => cb(err ? undefined : categories));
    }

    // cb(err)
    init(snapshot: ActivatedRouteSnapshot, cleanupPatient: Cb, cb: CbErr) {
        this.cleanupPatient = cleanupPatient;
        this.http.get<FhirApp>('/fhirApp/' + snapshot.paramMap.get('config')).subscribe(fhirApp => {
            if (!fhirApp || !fhirApp.dataEndpointUrl || !fhirApp.clientId) {
                cb('Application not setup correctly.');
                return;
            }
            if (snapshot.queryParams['state']) {
                this.fhirData.init();
            } else if (snapshot.queryParams['iss']) {
                FhirSmartService.authorize(fhirApp.clientId, snapshot.paramMap.get('config') || '');
            }
            this.fhirData.baseUrl = fhirApp.dataEndpointUrl;
            fhirApp.forms.forEach(f => {
                this.http.get<CdeForm>('/form/' + f.tinyId).subscribe(form => {
                    CdeForm.validate(form);
                    let patientForm: PatientForm = {
                        tinyId: form.tinyId,
                        name: form.designations[0].designation,
                        form: form,
                        observed: 0,
                        percent: 0,
                        total: 0,
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
        this.renderedResourceTree = addRootNode(deepCopy(patientForm.form), undefined, undefined, undefined);
        this.read(this.renderedResourceTree!)
            .then(() => this.updateProgress(this.renderedPatientForm!, this.renderedResourceTree!))
            .then(cb);
    }

    progressClear() {
        this.patientForms.forEach(f => {
            f.observed = 0;
            f.total = 0;
            f.percent = 0;
        });
    }

    questionnaireGet(f: CdeForm): Promise<FhirQuestionnaire> {
        return this.questionnaireSearch(f).then(r => {
            return r ? r : this.save(formToQuestionnaire(f, null, {publicUrl: codeSystemOut('NLM')}));
        });
    }

    questionnaireSearch(f: CdeForm): Promise<FhirQuestionnaire|undefined> {
        return this.fhirData.searchAll<FhirQuestionnaire>('Questionnaire',
            {identifier: codeSystemOut('NLM') + '|' + getTinyId(f) + '-' + getVersion(f)})
            .then(r => r.length > 1 ? this.selectOne('edit', r, 'Text', r => r.text ? r.text.div : '') : r[0]);
    }

    async read(tree: ResourceTreeRoot|ResourceTreeResource): Promise<void> {
        if (!ResourceTreeUtil.isRoot(tree) && ResourceTreeUtil.isResource(tree)) {
            await this.readResource(tree);
        }
        return new Promise<void>((resolve, reject) => {
            iterateFe(tree.crossReference,
                async (f, cb, options, i) => {
                    let parent = await options.return;
                    let self = addEmptyNode(f, _noop, parent);
                    if (self && ResourceTreeUtil.isNotRoot(self)) {
                        if (ResourceTreeUtil.isResource(self)) {
                            await this.readResource(self);
                        }
                        if (ResourceTreeUtil.isIntermediate(self)) {
                            CdeFhirService.readIntermediate(self, i);
                        }
                    }
                    cb(undefined, {return: self || parent});
                },
                async (s, cb, options, i) => {
                    let parent = await options.return;
                    let self = addEmptyNode(s, _noop, parent);
                    if (self && ResourceTreeUtil.isNotRoot(self)) {
                        if (ResourceTreeUtil.isIntermediate(self)) {
                            CdeFhirService.readIntermediate(self, i);
                        }
                    }
                    cb(undefined, {return: self || parent});
                },
                async (q, cb, options, i) => {
                    let parent = await options.return;
                    let self = addEmptyNode(q, _noop, parent);
                    if (self && ResourceTreeUtil.isNotRoot(self)) {
                        if (ResourceTreeUtil.isResource(self)) {
                            await this.readResource(self);
                            CdeFhirService.readQuestion(self);
                        } else if (ResourceTreeUtil.isAttribute(self)) {
                            CdeFhirService.readQuestionProperty(self, i);
                        }
                    }
                    cb(undefined, {return: self || parent});
                },
                err => err ? reject() : resolve(),
                {return: tree}
            );
        });
    }

    async readAgain(self: ResourceTreeRoot|ResourceTree, parent?: ResourceTreeRoot|ResourceTreeResource|ResourceTreeIntermediate): Promise<void> {
        if (!ResourceTreeUtil.isRoot(self)) {
            if (ResourceTreeUtil.isResource(self) && self.resource && self.resource.resourceType) {
                await this.readResource(self);
                if (self.crossReference.elementType === 'question') {
                    CdeFhirService.readQuestion(self);
                }
            } else if (ResourceTreeUtil.isAttribute(self) && parent && !ResourceTreeUtil.isRoot(parent)) {
                CdeFhirService.readQuestionProperty(self, self.crossReference);
            }
        }
        if (ResourceTreeUtil.isRoot(self) || !ResourceTreeUtil.isAttribute(self)) {
            return Promise.all((self as ResourceTreeRoot/*workaround*/).children.map(c => this.readAgain(c, self)))
                .then(_noop);
        }
    }

    static readIntermediate(self: ResourceTreeIntermediate, i: any) {
        switch (self.root.resourceType) {
            case 'Observation':
            case 'Procedure':
                throw assertThrow();
            case 'QuestionnaireResponse':
                if (self.parent.resource) {
                    ResourceTreeUtil.setResource(self, self.parent.resource.item[i]);
                    assertTrue(self.resource.linkId === self.crossReference.feId);
                }
                break;
            default:
                assertUnreachable(self.root.resourceType);
        }
    }

    static readQuestion(self: ResourceTree) {
        if (self.resource && self.resource.resourceType === 'Observation') {
            assertTrue(!self.resource.component);
            typedValueToValue(self.crossReference.question, valuedElementToItemType(self.resource), self.resource);
        }
    }

    static readQuestionProperty(self: ResourceTreeAttribute, i: any) {
        if (!self.parent.resource) {
            return;
        }
        let q: FormQuestion = self.crossReference;
        switch (self.root.resourceType) {
            case 'Observation':
                if (self.parentAttribute) {
                    let found = CdeFhirService.readQuestionPropertyMatch(self, self.parent.resource[self.parentAttribute] || []);
                    if (found) {
                        ResourceTreeUtil.setResource(self, found);
                        typedValueToValue(q.question, valuedElementToItemType(self.resource), self.resource);
                    }
                }
                break;
            case 'Procedure':
                if (propertyToQuestion(q, self.root, self.parentAttribute)) {
                    ResourceTreeUtil.setResource(self, self.root.resource[self.parentAttribute]);
                }
                break;
            case 'QuestionnaireResponse':
                if (self.parentAttribute) {
                    let found = CdeFhirService.readQuestionPropertyMatch(self, self.parent.resource[self.parentAttribute] || []);
                    if (found) {
                        ResourceTreeUtil.setResource(self, found);
                        if (self.resource.answer) {
                            let question = deepCopy(q.question);
                            let answer = self.resource.answer.map((a: FhirValue) => {
                                typedValueToValue(question, valuedElementToItemType(a), a);
                                return questionMulti(q) ? question.answer[0] : question.answer;
                            });
                            q.question.answer = questionMulti(q) ? answer : answer[0];
                        }
                    }
                }
                break;
            default:
                assertUnreachable(self.root.resourceType);
        }
    }

    static readQuestionPropertyMatch(self: ResourceTreeAttribute, resources: any[]): FhirObservationComponent|FhirQuestionnaireResponseItem|undefined {
        switch (self.root.resourceType) {
            case 'Observation':
                return resourceCodeableConceptMatch(resources, r => [r.code], getIds(self.crossReference)!);
            case 'Procedure':
                return resourceCodeableConceptMatch(resources, r => r ? [r] : [], getIds(self.crossReference)!);
            case 'QuestionnaireResponse':
                return resources.filter((item: FhirQuestionnaireResponseItem) => item.linkId === self.crossReference.feId)[0];
            default:
                assertUnreachable(self.root.resourceType);
        }
    }

    // set resource if found
    async readResource(self: ResourceTreeResource): Promise<ResourceTree> {
        // the following functions call ResourceTree.setResource(self, resource)
        if (await this.readResourceById(self)) { // (one) only if you already have a resource
            return self;
        }
        if (await this.readResourceByIdentifier(self)) { // (many) by low-grade CDE TinyId for conversion
            return self; // TODO: combine with code search
        }
        if (await this.readResourceByCode(self)) { // (many) ideal way to find
            return self;
        }
        if (await this.readResourceByParentRef(self)) {
            return self;
        }
        return self;
    }

    readResourceByCode(self: ResourceTreeResource): Promise<ResourceTree|undefined> {
        switch (self.resourceType) {
            case 'Observation':
                return new Promise<ResourceTree>((resolve, reject) => {
                    let resource: FhirObservation|FhirQuestionnaireResponse;
                    let codes = getIds(self.crossReference)!.filter(id => id.source === 'LOINC');
                    if (codes.length === 0) {
                        codes = getIds(self.crossReference)!.filter(id => id.source === 'NLM');
                    }
                    async_some(
                        codes,
                        (id: CdeId, done: CbErr<boolean>) => {
                            return this.fhirData.search<FhirObservation | FhirQuestionnaireResponse>(self.resourceType,
                                {code: (id.source ? codeSystemOut(id.source) + '|' : '') + id.id})
                                .then(r => r.length > 0 ? this.selectOne('edit', r, 'Last Edit', r => r.meta && new Date(r.meta.lastUpdated) || '') : r[0])
                                .then(r => {
                                    if (r) {
                                        resource = r;
                                        done(undefined, true);
                                    } else {
                                        done(undefined, false);
                                    }
                                }, done);
                        },
                        (err: string) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            if (resource) {
                                ResourceTreeUtil.setResource(self, resource);
                                resolve(self);
                                return;
                            }
                            resolve();
                        }
                    );
                });
            case 'Procedure':
                let procedureMapping = self.map ? self.map.mapping : undefined;
                if (procedureMapping) {
                    if (procedureMapping.procedureQuestionID === 'static') {
                        if (procedureMapping.procedureCode) {
                            return this.fhirData.search<FhirProcedure>('Procedure',
                                {code: (procedureMapping.procedureCodeSystem || 'SNOMED') + '|' + procedureMapping.procedureCode})
                                .then(r => r.length > 0 ? this.selectOne('edit', r, 'Text', r => r.text ? r.text.div : '') : r[0])
                                .then(r => {
                                    if (r) ResourceTreeUtil.setResource(self, r);
                                    return self;
                                });
                        }
                    } else {
                        if (procedureMapping.procedureQuestionID) {
                            let q = findQuestionByTinyId(procedureMapping.procedureQuestionID, self.crossReference);
                            if (q && q.question.answers.length) {
                                let procedures: FhirProcedure[] = [];
                                let subtype = self.map!.questionProperties
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
                                    .then(() => procedures.length > 0 ? this.selectOne('edit', procedures, 'Text', r => r.text ? r.text.div : '') : procedures[0])
                                    .then(r => {
                                        if (r) ResourceTreeUtil.setResource(self, r);
                                        return self;
                                    });
                            }
                        }
                    }
                }
                return Promise.resolve(undefined);
            case 'QuestionnaireResponse':
                return Promise.resolve(undefined);
            default:
                throw assertUnreachable(self.resourceType);
        }
    }

    readResourceById(self: ResourceTreeResource): Promise<ResourceTreeResource|undefined> {
        if (!self.resource || !self.resource.id || !self.resource.resourceType) {
            return Promise.resolve(undefined);
        }
        return this.fhirData.search<any>(self.resource.resourceType, {_id: self.resource.id})
            .then(r => r.length > 1 ? this.selectOne('edit', r, 'Last Edit', r => r.meta && new Date(r.meta.lastUpdated) || '') : r[0])
            .then(r => {
                if (r) {
                    ResourceTreeUtil.setResource(self, r);
                    return self;
                }
            });
    }

    readResourceByIdentifier(self: ResourceTreeResource): Promise<ResourceTreeResource|undefined> {
        if (self.resourceType === 'Observation') {
            return Promise.resolve(undefined);
        }
        return this.fhirData.search<any>(self.resourceType,
            {identifier: codeSystemOut('NLM') + '|' + getTinyId(self.crossReference)})
            .then(r => r.length > 1 ? this.selectOne('edit', r, 'Last Edit', r => r.meta && new Date(r.meta.lastUpdated) || '') : r[0])
            .then(r => {
                if (r) {
                    ResourceTreeUtil.setResource(self, r);
                    return self;
                }
            });
    }

    readResourceByParentRef(self: ResourceTreeResource): Promise<ResourceTreeResource|undefined> {
        switch (self.resourceType) {
            case 'Observation':
            case 'Procedure':
                return Promise.resolve(undefined);
            case 'QuestionnaireResponse':
                return this.questionnaireSearch(self.crossReference).then(questionnaire => {
                    if (questionnaire) {
                        self.lookupResource = questionnaire;
                        return this.fhirData.search<FhirQuestionnaireResponse>(self.resourceType,
                            {questionnaire: asRefString(self.lookupResource)})
                            .then(r => r.length > 0 ? this.selectOne('edit', r, 'Last Edit', r => r.meta && new Date(r.meta.lastUpdated) || '') : r[0])
                            .then(r => {
                                if (r) {
                                    ResourceTreeUtil.setResource(self, r);
                                    return self;
                                }
                            });
                    }
                });
            default:
                throw assertUnreachable(self.resourceType);
        }
    }

    save<T extends FhirDomainResource>(resource: T): Promise<T> {
        return new Promise<T>(resolve => {
            if (isFhirObservation(resource)) { // has category
                // fill in category from database config
                const system = codeSystemOut('LOINC');
                let categoryAble = resource as FhirObservation;
                let codes = reduceConcept<string[]>(categoryAble.code,
                    (a, coding) => coding.code && system === coding.system
                        ? a.concat(coding.code)
                        : a,
                    []);
                let categories: string[] = [];
                async_forEach(codes, (code: string, doneOne: CbErr) => {
                    this.getObservationCategory('LOINC', code, cats => {
                        if (isArray(cats)) {
                            categories = categories.concat(cats);
                        }
                        doneOne();
                    });
                }, () => {
                    let s = 'http://hl7.org/fhir/observation-category';
                    let existingCodes = reduceOptionalArray<string[], FhirCodeableConcept>(categoryAble.category || [],
                        (a, concept) => {
                            return a.concat(reduceConcept<string[]>(concept,
                                (ac, c) => {
                                    c.code && c.system === s && ac.push(c.code);
                                    return a;
                                },
                                []));
                        },
                        []);
                    let match = valueSets.get(s);
                    let names = match && match.codes;
                    _uniq(categories).forEach(c => {
                        if (existingCodes.indexOf(c) === -1) {
                            if (!categoryAble.category) categoryAble.category = [];
                            categoryAble.category.push(newCodeableConcept([newCoding(s, c, undefined,
                                names && names.get(c))]));
                        }
                    });
                    resolve(resource);
                });
            } else {
                resolve(resource);
            }
        }).then(this.fhirData.save.bind(this.fhirData));
    }

    // cb(err)
    saveTree(node: ResourceTreeRoot | ResourceTree, cb: CbErr<any>) {
        async_series([
            (done: CbErr) => {
                if (ResourceTreeUtil.isNotRoot(node) && ResourceTreeUtil.isResource(node)) {
                    this.saveTreeNode(node, done);
                } else {
                    done();
                }
            },
            (done: CbErr) => {
                if (ResourceTreeUtil.isRoot(node) || !ResourceTreeUtil.isAttribute(node)) {
                    async_forEach(node.children, this.saveTree.bind(this), done);
                } else {
                    done();
                }
            }
        ], cb);
    }

    // cb(err, resource)
    saveTreeNode(node: ResourceTreeResource, cb: CbErr<any>) {
        if (node.resource && (node.resourceRemote === null || node.resourceRemote
            && diff.diff(node.resourceRemote, node.resource))) {
            if (node.resourceRemote && !node.resource.id) {
                throw new Error('Error: ResourceTree bad state');
            }
            Promise.resolve().then(() => {
                switch (node.resourceType) {
                    case 'Observation':
                        // if (node.resource.device && node.resource.device.indexOf('Device/new') > -1) {
                        //     let device = devices[parseInt(p.after.device.slice(10))];
                        //     return service.save(device).then(device => {
                        //         node.resource.device = asRefString(device);
                        //     });
                        // }
                        break;
                    case 'Procedure':
                        break;
                    case 'QuestionnaireResponse':
                        if (!node.resource.questionnaire) {
                            return this.questionnaireGet(node.crossReference).then(questionnaire => {
                                node.resource.questionnaire = toRef(questionnaire);
                            });
                        }
                        break;
                    default:
                        assertUnreachable(node.resourceType);
                }
            }).then(() => {
                this.save(node.resource).then(resource => {
                    ResourceTreeUtil.setResource(node, resource);
                    cb(undefined, resource);
                }, cb);
            }, cb);
        } else {
            cb();
        }
    }

    selectEncounter() {
        this.fhirData.search<FhirEncounter>('Encounter', {})
            .then(r => this.selectOne('filter', r, 'Text', r => r.text ? r.text.div : ''))
            .then(r => {
                this.fhirData.context = r;
                this.progressClear();
            });
    }

    selectOne<T>(type: 'filter'|'edit', resources: T[], ...columns: (string|CbRet1<any, T>)[]): Promise<T|undefined> {
        return new Promise<T>(resolve => {
            const dialogRef = this.dialog.open(SelectOneDialogComponent, {
                data: {resources, type, columns}
            });
            dialogRef.afterClosed().subscribe(result => {
                resolve(result);
            });
        });
    }

    selectPatient() {
        this.fhirData.searchAll<FhirProcedure>('Patient', {})
            .then(r => this.selectOne('filter', r, 'Name', r => r.text ? r.text.div : ''))
            .then(r => {
                if (r) {
                    this.fhirData.patient = r;
                    this.cleanupPatient();
                    this.progressClear();
                    this.fhirData.context = undefined;
                }
            });
    }

    submit(cb: CbErr) {
        this.write(this.renderedResourceTree!).then(() => {
            this.saveTree(this.renderedResourceTree!, err => {
                if (err) {
                    cb(err);
                    return;
                }
                this.readAgain(this.renderedResourceTree!)
                    .then(() => this.updateProgress(this.renderedPatientForm!, this.renderedResourceTree!))
                    .then(() => cb());
            });
        });
    }

    async write(self: any, parentResource?: ResourceTreeResource): Promise<void> {
        if (ResourceTreeUtil.isNotRoot(self) && isQuestion(self.crossReference)) {
            if (ResourceTreeUtil.isResource(self) && supportedFhirResourcesArray.indexOf(self.resourceType) > -1
                && isSupportedResourceRelationship(self, parentResource)) {
                await this.writeQuestionResource(self);
                parentResource = self;
            } else if (ResourceTreeUtil.isAttribute(self) && supportedFhirResourcesArray.indexOf(self.root.resourceType) > -1
                && (!resourceMap[self.root.resourceType] || self.root.map)) {
                await self.parent.resource;
                await this.writeQuestionAttribute(self);
            } else {
                if (parentResource !== self) {
                    throw new Error('Error: not supported FHIR relationship: parent '
                        + parentResource && parentResource!.resourceType
                        + ', child ' + self.resourceType + '.');
                }
            }
        }
        if (ResourceTreeUtil.isRoot(self) || !ResourceTreeUtil.isAttribute(self)) {
            return Promise.all(self.children.map((c: ResourceTreeRoot | ResourceTreeResource | ResourceTreeIntermediate) => this.write(c, parentResource)))
                .then(() => {
                    if (!ResourceTreeUtil.isRoot(self) && ResourceTreeUtil.isResource(self)) {
                        staticToProperty(self);
                    }
                    return;
                });
        }
    }

    async writeQuestionAttribute(self: ResourceTree) {
        let q: FormQuestion = self.crossReference;
        if (!self.resource && questionAnswered(q)) {
            await this.createParents(self);
        }
        switch (self.root.resourceType) {
            case 'Observation': // Component Observation
                if (self.resource) {
                    questionToFhirValue(q, self.resource, false, 'value', true);
                }
                break;
            case 'Procedure':
                if (ResourceTreeUtil.isAttribute(self) && (self.resource || questionAnswered(q))) { // creates/deletes the property object
                    questionToProperty(q, self.root, self.parentAttribute);
                }
                break;
            case 'QuestionnaireResponse':
                if (self.resource) {
                    self.resource.answer = [];
                    let answer = questionMulti(q) ? q.question.answer : [q.question.answer];
                    let qType = containerToItemType(q.question);
                    let fhirValue = {};
                    storeTypedValue(
                        answer.map((a: any) => valueToTypedValue(q.question, qType, a, undefined,
                            q.question.answerUom, false))[0],
                        fhirValue, qType, 'value', false);
                    self.resource.answer.push(fhirValue);
                }
                break;
            default:
                assertUnreachable(self.root.resourceType);
        }
    }

    async writeQuestionResource(self: ResourceTreeResource) {
        let q: FormQuestion = self.crossReference;
        switch (self.resourceType) {
            case 'Observation': // Question Observation
                if (!self.resource && questionAnswered(q)) {
                    await this.createParents(self);
                }
                if (self.resource) {
                    questionToFhirValue(q, self.resource, false, 'value', true);
                }
                break;
            case 'Procedure':
            case 'QuestionnaireResponse':
                throw assertThrow();
            default:
                assertUnreachable(self.resourceType);
        }
    }

    updateProgress(f: PatientForm, tree: ResourceTreeRoot|ResourceTreeResource) {
        f.observed = 0;
        f.total = 0;
        f.percent = 0;
        (function traverseTree(node: ResourceTreeRoot|ResourceTree) {
            if (ResourceTreeUtil.isRoot(node)) {
                node.children.forEach(n => traverseTree(n));
            } else if (ResourceTreeUtil.isResource(node)) {
                f.total++;
                if (node.resourceRemote) {
                    f.observed++;
                }
            }
        })(tree);
        f.percent = 100 * f.observed / f.total;
    }
}

@Component({
    styles: [`
        .mat-raised-button, .mat-raised-button ::ng-deep .mat-button-wrapper {
            line-height: 28px;
        }
        .table th, .table td {
            padding: .4rem;
        }
    `],
    template: `
        <h2 mat-dialog-title>Select One {{data.resources[0]?.resourceType}}:</h2>
        <div mat-dialog-content>
            <table *ngIf="data.resources.length; else noneFound" class="table">
                <thead>
                <tr>
                    <th></th>
                    <th>Id</th>
                    <th *ngFor="let name of columnNames">{{name}}</th>
                </tr>
                </thead>
                <tbody>
                <tr *ngFor="let resource of data.resources">
                    <td>
                        <button mat-raised-button color="primary" [mat-dialog-close]="resource">Select</button>
                    </td>
                    <td>{{resource.id}}</td>
                    <td *ngFor="let get of columnGetters" [innerHtml]="get(resource)"></td>
                </tr>
                <tr *ngIf="data.resources.length === 10" style="text-align: center">
                    <td [attr.colspan]="2 + columnNames.length">... (more)</td>
                </tr>
                </tbody>
            </table>
            <ng-template #noneFound>None Found</ng-template>
        </div>
        <div mat-dialog-actions>
            <button mat-raised-button color="basic" mat-dialog-close cdkFocusInitial>{{data.type==='filter'?'None':'New'}}</button>
        </div>
    `,
})
export class SelectOneDialogComponent {
    columnNames: string[] = [];
    columnGetters: CbRet<any, any>[] = [];
    constructor(@Inject(MAT_DIALOG_DATA) public data: {resources: FhirDomainResource[], type: FhirAppViewModes, columns: any}) {
        let size = Math.floor(data.columns.length / 2);
        for (let i = 0; i < size; i++) {
            this.columnNames[i] = data.columns[i * 2];
            this.columnGetters[i] = data.columns[i * 2 + 1];
        }
    }
}
