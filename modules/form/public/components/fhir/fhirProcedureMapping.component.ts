import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import './fhirMapping.scss';
import { FhirProcedureMapping, FormQuestion } from 'shared/form/form.model';

@Component({
    templateUrl: './fhirProcedureMapping.component.html',
})
export class FhirProcedureMappingComponent {
    dateQuestions: FormQuestion[];
    mapping: FhirProcedureMapping;
    questions: FormQuestion[];
    usedRefs!: FormQuestion;
    valueListQuestions: FormQuestion[];

    constructor(@Inject(MAT_DIALOG_DATA) data: any) {
        this.questions = data.questions;
        this.dateQuestions = this.questions.filter(q => q.question.datatype === 'Date');
        this.valueListQuestions = this.questions.filter(q => q.question.datatype === 'Value List');
        this.mapping = data.mapping || {};
        if (data.usedRefs) {
            this.usedRefs = data.usedRefs;
        }

    }

    initRefMaps(usedRefs: FormQuestion) {
        if (usedRefs) {
            this.mapping.usedReferencesMaps = new Array(usedRefs.question.datatype === 'Value List'
                ? usedRefs.question.cde.permissibleValues.length : 0);
            this.mapping.usedReferences = usedRefs.question.cde.tinyId;
        }
    }

    isTinyIdSingleSelect(tinyId: string): boolean {
        const match = this.questions.filter(q => q.question.cde.tinyId === tinyId);
        return !match.length || match[0].question.datatype !== 'Value List' || !match[0].question.multiselect;
    }
}
