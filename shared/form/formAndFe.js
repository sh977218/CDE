import { CdeForm } from 'shared/form/form.model';

export function deleteTag(f, tag) {
    f.tags.splice(f.tags.indexOf(tag), 1);
}

export function deleteTags(f, key) {
    getTags(f, key).forEach(tag => deleteTag(f, tag));
}

export function getTag(f, key) {
    let tags = getTags(f, key);
    return tags.length ? tags[0] : undefined;
}

export function getTags(f, key) {
    return f.tags.filter(t => t.key === key);
}

export function newTag(f, key) {
    let tag = {key: key, value: undefined};
    f.tags.push(tag);
    return tag;
}
