import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import './fhirMapping.scss';
import { FhirProcedureMapping, FormQuestion } from 'shared/form/form.model';

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
        if (data.usedRefs) {
            this.usedRefs = data.usedRefs;
        }

    }

    initRefMaps(usedRefs) {
        if (usedRefs) {
            this.mapping.usedReferencesMaps = new Array(usedRefs.question.cde.permissibleValues.length);
            this.mapping.usedReferences = usedRefs.question.cde.tinyId;
        }
    }

    isTinyIdSingleSelect(tinyId: string): boolean {
        const match = this.questions.filter(q => q.question.cde.tinyId === tinyId);
        return !!match.length && !match[0].question.multiselect;
    }
}
