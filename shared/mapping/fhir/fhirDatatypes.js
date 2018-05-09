import { externalCodeSystems } from 'shared/mapping/fhir';

export function codeSystemIn(uri) {
    let results = externalCodeSystems.filter(c => c.uri === uri);
    if (results.length) return results[0].id;
    else return 'no code system';
}

export function codeSystemOut(system, fe = null) {
    let s = system;
    if (fe && fe.question && fe.question.cde && Array.isArray(fe.question.cde.ids) && fe.question.cde.ids.length) {
        s = fe.question.cde.ids[0].source;
    }

    let external = externalCodeSystems.filter(e => e.id === s);
    if (external.length) {
        return external[0].uri;
    } else {
        return s;
    }
}

export function codingArrayPreview(codings) {
    return codings.reduce((a, v) => a += v.display + ' ' + codeSystemIn(v.system) + ':' + v.code + '\n', '');
}

export function newReference(ref) {
    return {
        reference: ref
    };
}

export function valuePreview(container, prefix = 'value') {
    if (!container) {
        return;
    }
    if (container[prefix + 'CodeableConcept']) {
        return codingArrayPreview(container.valueCodeableConcept.coding);
    } else if (container[prefix + 'Quantity']) {
        let quantity = container.valueQuantity;
        if (quantity.value === undefined) {
            return;
        }
        return quantity.value + ' ' + (quantity.code || '(no unit)') + ' (' + codeSystemIn(quantity.system) + ')';
    } else if (container.component) {
        let value = container.component.reduce((a, v) => {
            let vs = valuePreview(v);
            if (vs === undefined) return a;
            return a + codingArrayPreview(v.code.coding) + ' = ' + vs + '\n';
        }, '');
        if (value !== '') {
            return value;
        }
    } else {
        return JSON.stringify(container);
    }
}
