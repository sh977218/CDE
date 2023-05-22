import { Component } from '@angular/core';
import { Concept } from 'shared/de/dataElement.model';

@Component({
    templateUrl: './add-concept-modal.component.html',
})
export class AddConceptModalComponent {
    newConcept: Concept = { origin: 'LOINC', type: 'dec' };
}
