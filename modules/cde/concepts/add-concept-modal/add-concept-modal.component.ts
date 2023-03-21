import { Component } from '@angular/core';

type Concept = { name?: string; originId?: string; origin: string; type: string };

@Component({
    templateUrl: './add-concept-modal.component.html',
})
export class AddConceptModalComponent {
    newConcept: Concept = { origin: 'LOINC', type: 'dec' };
}
