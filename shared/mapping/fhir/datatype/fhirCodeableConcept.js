import { reduceOptionalArray } from 'shared/system/util';

export function getText(concept) {
    return concept && concept.text || Array.isArray(concept.coding) && concept.coding.some() || '';
}

export function getTextFromArray(conceptArray) {
    return Array.isArray(conceptArray) ? conceptArray.map(getText).join(', ') : '';
}

export function newCodeableConcept(coding, text) {
    if (!text && Array.isArray(coding)) {
        coding.some(c => {
            if (c.display) {
                text = c.display;
                return true;
            }
        });
    }
    return {coding: coding, text: text};
}

export function reduce(concept, codingCb, initialValue) {
    return reduceOptionalArray(concept.coding, codingCb, initialValue);
}
