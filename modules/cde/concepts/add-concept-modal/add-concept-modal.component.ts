import { Component } from '@angular/core';
import { Concept } from 'shared/de/dataElement.model';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

@Component({
    templateUrl: './add-concept-modal.component.html',
    imports: [MatDialogModule, MatInputModule, FormsModule, MatSelectModule],
    standalone: true,
})
export class AddConceptModalComponent {
    newConcept: Concept = { origin: 'LOINC', type: 'dec' };
}
