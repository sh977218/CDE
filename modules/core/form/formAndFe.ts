import { CdeId } from 'shared/models.model';
import { CdeForm, FormElement } from 'shared/form/form.model';
import { supportedFhirResources } from 'shared/mapping/fhir/fhirResource.model';

export function getFhirResourceMap(f: CdeForm|FormElement): any {
    return isForm(f) && f.displayProfiles.length ? f.displayProfiles[0].fhirProcedureMapping : undefined;
}

export function getIds(f: CdeForm|FormElement): CdeId[]|undefined {
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

export function getMapToFhirResource(f: CdeForm|FormElement): supportedFhirResources | undefined {
    return f && isMappedTo(f, 'fhir') ? f.mapTo!.fhir!.resourceType : undefined;
}

export function getTinyId(f: CdeForm|FormElement): string|undefined {
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

export function getVersion(f: CdeForm|FormElement): string|undefined {
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

export function isForm(f: CdeForm|FormElement): f is CdeForm {
    return f.hasOwnProperty('tinyId');
}

export function isMappedTo(f: CdeForm|FormElement, systemOrProtocol: string): boolean {
    return !!f.mapTo && !!f.mapTo[systemOrProtocol];
}
