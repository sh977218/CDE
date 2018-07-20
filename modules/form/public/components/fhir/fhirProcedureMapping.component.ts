import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import './fhirMapping.scss';
import { FhirProcedureMapping, FormQuestion } from 'shared/form/form.model';
import { Form } from '@angular/forms';

@Component({
    selector: 'cde-fhir-procedure-mappin',
    templateUrl: './fhirProcedureMapping.component.html',
})
export class FhirProcedureMappingComponent {

    @Output() onChanged = new EventEmitter();
    @Output() onClosed = new EventEmitter();

    questions: FormQuestion[];
    dateQuestions: FormQuestion[];
    valueListQuestions: FormQuestion[];

    mapping: FhirProcedureMapping;
    usedRefs: FormQuestion;

    constructor(@Inject(MAT_DIALOG_DATA) data) {
        this.questions = data.questions;
        this.dateQuestions = this.questions.filter(q => q.question.datatype === 'Date');
        this.valueListQuestions = this.questions.filter(q => q.question.datatype === 'Value List');
        this.mapping = data.mapping || {};
    }

    initRefMaps () {
        if (this.usedRefs) {
            this.mapping.usedReferencesMaps = new Array(this.usedRefs.question.cde.permissibleValues.length);
            this.mapping.usedReferences = this.usedRefs.question.cde.tinyId;
        }
    }

}