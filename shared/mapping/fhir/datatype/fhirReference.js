import { capString } from 'shared/system/util';

export function asRefString(resource) {
    return resource.resourceType + '/' + resource.id;
}

export function getRef(ref) {
    return ref ? ref.reference : undefined;
}

export function isRef(ref) {
    return !!getRef(ref);
}

export function isRefType(resourceType, ref) {
    return isRef(ref) && ref.reference.startsWith(resourceType + '/');
}

export function newReference(r) {
    return {
        reference: r
    };
}

export function parseRef(ref, resourceType = undefined) {
    if (resourceType && isRefType(resourceType, ref) || !resourceType && isRef(ref)) {
        let delim = ref.reference.indexOf('/');
        if (delim > 0) {
            return [ref.reference.substr(0, delim), ref.reference.substr(delim + 1)];
        }
    }
    return [];
}

export function toRef(resource) {
    return newReference(asRefString(resource));
}
