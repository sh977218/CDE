import { codeSystemIn } from 'shared/mapping/fhir';
import { getText as conceptGetText } from 'shared/mapping/fhir/datatype/fhirCodeableConcept';

// TODO: remove, only get text, not "text system:code"
export function codingArrayPreview(codings) {
    return codings.reduce((a, v) => a += codingPreview(v) + '\n', '');
}

function codingPreview(coding) {
    return coding.display + ' ' + codeSystemIn(coding.system) + ':' + coding.code;
}

export function valuePreview(container, prefix = 'value') {
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
        let q = container[prefix + 'Quantity'];
        return q.value
            ? q.value + ' ' + (q.code || '(no unit)') + ' (' + (codeSystemIn(q.system) || 'no code system') + ')'
            : '';
    } else if (container[prefix + 'String']) {
        return container[prefix + 'String'];
    } else if (container.component) {
        return container.component.reduce((a, v) => {
            let vs = valuePreview(v);
            return a + (vs ? codingArrayPreview(v.code.coding) + ' = ' + vs + '\n' : '');
        }, '');
    }
    return '';
}
