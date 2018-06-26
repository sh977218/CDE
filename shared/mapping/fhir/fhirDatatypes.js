import { externalCodeSystems, externalCodeSystemsMap } from 'shared/mapping/fhir';

export function codeSystemIn(uri) {
    let results = externalCodeSystems.filter(c => c.uri === uri);
    return results.length ? results[0].id : '';
}

export function codeSystemOut(system, fe = null) {
    let s = system;
    if (fe && fe.question && fe.question.cde && Array.isArray(fe.question.cde.ids) && fe.question.cde.ids.length) {
        s = fe.question.cde.ids[0].source;
    }

    return s ? externalCodeSystemsMap[s] || s : undefined;
}

export function codingArrayPreview(codings) {
    return codings.reduce((a, v) => a += codingPreview(v) + '\n', '');
}

export function codingPreview(coding) {
    return coding.display + ' ' + codeSystemIn(coding.system) + ':' + coding.code;
}

export function getRef(resource) {
    return resource.resourceType + '/' + resource.id;
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
    if (container[prefix + 'Code']) {
        return container[prefix + 'Code'];
    } else if (container[prefix + 'CodeableConcept']) {
        return codingArrayPreview(container[prefix + 'CodeableConcept'].coding);
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
        let quantity = container[prefix + 'Quantity'];
        if (quantity.value === undefined) {
            return;
        }
        return quantity.value + ' ' + (quantity.code || '(no unit)')
            + ' (' + (codeSystemIn(quantity.system) || 'no code system') + ')';
    } else if (container[prefix + 'String']) {
        return container[prefix + 'String'];
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
        return undefined;
    }
}
