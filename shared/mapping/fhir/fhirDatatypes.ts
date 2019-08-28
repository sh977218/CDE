import { codeSystemIn } from 'shared/mapping/fhir';
import { FhirCoding, FhirValue } from 'shared/mapping/fhir/fhir.model';
import { getText as conceptGetText } from 'shared/mapping/fhir/datatype/fhirCodeableConcept';
import { FhirDomainResource, FhirObservation } from 'shared/mapping/fhir/fhirResource.model';

// TODO: remove, only get text, not "text system:code"
export function codingArrayPreview(codings?: FhirCoding[]): string {
    return codings ? codings.reduce((a, v) => a += codingPreview(v) + '\n', '') : '';
}

function codingPreview(coding: FhirCoding) {
    return coding.display + ' ' + codeSystemIn(coding.system) + ':' + coding.code;
}

export function getDateString(resource: FhirDomainResource, periodName: string = '', dateTimeName: string = '',
                              instanceName: string = ''): string {
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

export function valuePreview(container: FhirValue, prefix: string = 'value'): string {
    if (!container) {
        return '';
    }
    if (container[prefix + 'Code']) {
        return container[prefix + 'Code'];
    } else if (container[prefix + 'CodeableConcept']) {
        return conceptGetText(container[prefix + 'CodeableConcept']);
    } else if (container[prefix + 'Coding']) {
        return codingPreview(container[prefix + 'Coding']);
    } else if (container[prefix + 'Date']) {
        return container[prefix + 'Date'];
    } else if (container[prefix + 'DateTime']) {
        return container[prefix + 'DateTime'];
    } else if (container[prefix + 'Decimal']) {
        return '' + container[prefix + 'Decimal'];
    } else if (container[prefix + 'Integer']) {
        return '' + container[prefix + 'Integer'];
    } else if (container[prefix + 'Quantity']) {
        const q = container[prefix + 'Quantity'];
        return q.value
            ? q.value + ' ' + (q.code || '(no unit)') + ' (' + (codeSystemIn(q.system) || 'no code system') + ')'
            : '';
    } else if (container[prefix + 'String']) {
        return container[prefix + 'String'];
    } else {
        const observation = container as FhirObservation;
        if (observation.component) {
            return observation.component.reduce((a: string, v) => {
                const vs = valuePreview(v);
                return a + (vs ? codingArrayPreview(v.code.coding) + ' = ' + vs + '\n' : '');
            }, '');
        }
    }
    return '';
}
