import { FormElement } from 'shared/form/form.model';

declare const externalCodeSystems: {id: string, uri: string}[];
declare const externalCodeSystemsMap: any;
declare function codeSystemIn(uri): string;
declare function codeSystemOut(system: string, fe?: FormElement): string;
