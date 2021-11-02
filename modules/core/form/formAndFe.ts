import { CdeId } from 'shared/models.model';
import { CdeForm, FormElement, FormOrElement } from 'shared/form/form.model';
import { isCdeFormNotFe } from 'shared/item';
import { supportedFhirResources } from 'shared/mapping/fhir/fhirResource.model';

export function getFhirResourceMap(f: FormOrElement): any {
    return isCdeFormNotFe(f) && f.displayProfiles.length ? f.displayProfiles[0].fhirProcedureMapping : undefined;
}

export function getMapToFhirResource(f: FormOrElement): supportedFhirResources | undefined {
    return f && f.mapTo && f.mapTo.fhir ? f.mapTo.fhir.resourceType : undefined;
}

export function getTinyId(f: FormOrElement): string|undefined {
    if (isCdeFormNotFe(f)) {
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
    if (isCdeFormNotFe(f)) {
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
