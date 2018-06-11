import { CdeForm, FormElement, ObjectTag } from 'shared/form/form.model';

declare function deleteTag(f: CdeForm|FormElement, tag: ObjectTag): void;
declare function deleteTags(f: CdeForm|FormElement, key: string): void;
declare function getTag(f: CdeForm|FormElement, key: string): ObjectTag;
declare function getTags(f: CdeForm|FormElement, key: string): ObjectTag[];
declare function newTag(f: CdeForm|FormElement, key: string): ObjectTag;
