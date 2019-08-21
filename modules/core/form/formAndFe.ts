import { CdeId } from 'shared/models.model';
import { CdeForm, FormElement, FormOrElement } from 'shared/form/form.model';
import { supportedFhirResources } from 'shared/mapping/fhir/fhirResource.model';

export function getFhirResourceMap(f: FormOrElement): any {
    return isForm(f) && f.displayProfiles.length ? f.displayProfiles[0].fhirProcedureMapping : undefined;
}

export function getIds(f: CdeForm): CdeId[];
export function getIds(f: FormOrElement): CdeId[] | undefined;
export function getIds(f: FormOrElement): CdeId[] | undefined {
    if (isForm(f)) {
        return f.ids;
    }
    switch (f.elementType) {
        case 'form':
            return f.inForm.form.ids;
        case 'section':
            return undefined;
        case 'question':
            return f.question.cde.ids;
    }
}

export function getMapToFhirResource(f: FormOrElement): supportedFhirResources | undefined {
    return f && f.mapTo && f.mapTo.fhir ? f.mapTo.fhir.resourceType : undefined;
}

export function getTinyId(f: FormOrElement): string|undefined {
    if (isForm(f)) {
        return f.tinyId;
    }
    switch (f.elementType) {
        case 'form':
            return f.inForm.form.tinyId;
        case 'section':
            return undefined;
        case 'question':
            return f.question.cde.tinyId;
    }
}

export function getVersion(f: FormOrElement): string|undefined {
    if (isForm(f)) {
        return f.version;
    }
    switch (f.elementType) {
        case 'form':
            return f.inForm.form.version;
        case 'section':
            return undefined;
        case 'question':
            return f.question.cde.version;
    }
}

export function isForm(f: FormOrElement): f is CdeForm {
    return f.hasOwnProperty('tinyId');
}
