import _isEqual from 'lodash/isEqual';

import { FhirMapped, getMapPropertyFromId, supportedResourcesMaps } from '_fhirApp/resources';
import { ResourceTreeResource } from '_fhirApp/resourceTree';
import { assertThrow } from 'shared/models.model';
import { questionMulti } from 'shared/form/fe';
import { FormQuestion } from 'shared/form/form.model';
import { codeSystemOut } from 'shared/mapping/fhir';
import { FhirCodeableConcept, FhirCoding } from 'shared/mapping/fhir/fhir.model';
import { FhirAnnotation } from 'shared/mapping/fhir/fhirResource.model';
import { newCodeableConcept } from 'shared/mapping/fhir/datatype/fhirCodeableConcept';
import { newCoding } from 'shared/mapping/fhir/datatype/fhirCoding';
import { newPeriod } from 'shared/mapping/fhir/datatype/fhirPeriod';
import { getRef, newReference } from 'shared/mapping/fhir/datatype/fhirReference';

export function propertyToQuestion(q: FormQuestion, parent: ResourceTreeResource, name: string): boolean {
    const map: supportedResourcesMaps|undefined = parent.map;
    const resource = parent.resource;
    const [propertyMap] = getMapPropertyFromId(q.question.cde.tinyId, map);
    if (!resource || !propertyMap) {
        return false;
    }
    let value;
    switch (propertyMap.type) {
        case 'backbone':
            throw assertThrow();
        case 'choiceType':
            if (_isEqual(propertyMap.properties, ['dateTime', 'Period'])) {
                const period = resource[propertyMap.property + 'Period'];
                if (period) {
                    value = [period.start, period.end];
                } else {
                    const date = resource[propertyMap.property + 'DateTime'];
                    value = date ? [date] : [];
                }
            } else {
                assertThrow();
            }
            break;
        default:
            const answer = resource[name]
                ? (propertyMap.max === -1 || propertyMap.max > 1
                    ? resource[name]
                    : [resource[name]]
                )
                : [];
            switch (propertyMap.type) {
                // case 'Period': // different from the rest [start, end]
                //     answer = newPeriod(...value);
                //     break;
                case 'FhirAnnotation':
                    value = answer.map((v: FhirAnnotation) => v.text);
                    break;
                case 'FhirCodeableConcept':
                    // take first only
                    value = answer.map((v: FhirCodeableConcept) => v.coding && v.coding[0] && v.coding[0].code);
                    break;
                case 'FhirReference':
                    value = answer.map(getRef);
                    break;
                default:
                    value = answer;
            }
            if (name === 'usedReference' && map && map.mapping && Array.isArray(map.mapping.usedReferencesMaps)) {
                value = value.map((a: string) => {
                    const i = map!.mapping.usedReferencesMaps!.indexOf(a);
                    if (i > -1 && q.question.answers![i] && q.question.answers![i].permissibleValue) {
                        return q.question.answers![i].permissibleValue;
                    }
                    return a;
                });
            }
    }
    // for mismatch array to single-select, only take first
    q.question.answer = questionMulti(q) ? value : value[0];
    return true;
}

export function questionToProperty(q: FormQuestion, parent: ResourceTreeResource, name: string): boolean {
    const map: supportedResourcesMaps|undefined = parent.map;
    const resource = parent.resource;
    const [propertyMap] = getMapPropertyFromId(q.question.cde.tinyId, map);
    if (!resource || !propertyMap) {
        return false;
    }
    let value = questionMulti(q) ? q.question.answer : [q.question.answer];
    if (!value.length && propertyMap.default) {
        value = [propertyMap.default];
    }
    if (!value) { value = []; }
    switch (propertyMap.type) {
        case 'backbone':
            throw assertThrow();
        case 'choiceType':
            if (_isEqual(propertyMap.properties, ['dateTime', 'Period'])) {
                switch (value.length) {
                    case 2:
                        resource[propertyMap.property + 'DateTime'] = undefined;
                        resource[propertyMap.property + 'Period'] = newPeriod(value[0], value[1]);
                        break;
                    case 1:
                        resource[propertyMap.property + 'DateTime'] = value[0];
                        resource[propertyMap.property + 'Period'] = undefined;
                        break;
                    default:
                        resource[propertyMap.property + 'DateTime'] = undefined;
                        resource[propertyMap.property + 'Period'] = undefined;
                }
            } else {
                assertThrow();
            }
            break;
        default:
            if (name === 'usedReference' && map && map.mapping && Array.isArray(map.mapping.usedReferencesMaps)) {
                value = value.map((a: string) => {
                    const match = q.question.answers!.filter(pv => pv.permissibleValue === a)[0];
                    if (match) {
                        const staticValue = map!.mapping.usedReferencesMaps![q.question.answers!.indexOf(match)];
                        if (staticValue) {
                            return staticValue;
                        }
                    }
                    return a;
                });
            }
            const answer: any = value.map((a: string) => typedValueToProperty(propertyMap!, a));
            if (propertyMap.max === -1 || propertyMap.max > 1) {
                if (questionMulti(q)) {
                    // replace
                    resource[name] = answer.length ? answer : undefined;
                } else {
                    // mismatch single-select to array, partial update, no delete
                    if (!Array.isArray(resource[name])) { resource[name] = []; }
                    value.forEach((v: string, i: number) => {
                        const index = presentIndex(resource[name], propertyMap!, value[0]);
                        if (index > -1) {
                            resource[name][index] = answer[i];
                        } else {
                            resource[name].push(answer[i]);
                        }
                    });
                    if (resource[name].length === 0) { resource[name] = undefined; }
                }
            } else {
                resource[name] = answer[0];
            }
            if (propertyMap.min > 0 && !resource[name]) {
                assertThrow();
            }
    }
    return true;
}

function presentIndex(list: any[], propertyMap: FhirMapped, v: any): number {
    const match = list.filter(l => {
        switch (propertyMap.type) {
            // case 'Period': // won't work without value
            //     return l.start === value[0] && l.end === value[1];
            case 'FhirAnnotation':
                return l.text === v;
            case 'FhirCodeableConcept':
                return l.coding.some((c: FhirCoding) => c.system === codeSystemOut(propertyMap.subTypes[0] || 'SNOMED') && c.code === v);
            case 'FhirReference':
                return l.reference === v;
            default:
                return l === v;
        }
    });
    return match.length ? list.indexOf(match[0]) : -1;
}

export function staticToProperty(self: ResourceTreeResource) {
    if (!self.resource || !self.map) {
        return false;
    }
    const ids = self.map.questionIds;
    const map: supportedResourcesMaps = self.map;
    const resource = self.resource;
    self.map.questionProperties.forEach((propertyMap, i) => {
        if (ids[i] === 'static') {
            const value = propertyMap.mapFieldValue && map.mapping[propertyMap.mapFieldValue];
            if (value) {
                const answer = typedValueToProperty(propertyMap, value, map.mapping[propertyMap.mapFieldValue + 'System']);
                const name = propertyMap.property;
                if (propertyMap.max === -1 || propertyMap.max > 1) {
                    resource[name] = answer ? [answer] : undefined;
                } else {
                    resource[name] = answer;
                }
            } else {
                if (typeof(resource[name]) !== 'undefined') {
                    resource[name] = undefined;
                }
            }
            if (propertyMap.min > 0 && !resource[name]) {
                assertThrow();
            }
        }
    });
}

function typedValueToProperty(propertyMap: FhirMapped, value: string, system?: string) {
    switch (propertyMap.type) {
        // case 'Period': // different from the rest [start, end]
        //     answer = newPeriod(...value);
        //     break;
        case 'FhirAnnotation':
            return ({text: value});
        case 'FhirCodeableConcept':
            return newCodeableConcept([newCoding(
                codeSystemOut(system || propertyMap.subTypes[0] || 'SNOMED'),
                value
            )]);
        case 'FhirReference':
            return newReference(value);
        default:
            return value;
    }
}
