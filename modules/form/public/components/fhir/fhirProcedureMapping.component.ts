import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'cde-fhir-procedure-mappin',
    templateUrl: './fhirProcedureMapping.component.html'
})
export class FhirProcedureMappingComponent {

    @Output() onChanged = new EventEmitter();
    @Output() onClosed = new EventEmitter();

    mapping: {
        status?: string
    } = {};


}