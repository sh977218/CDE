import { Component, Input } from '@angular/core';
import { DataElement } from 'shared/de/dataElement.model';

@Component({
    selector: 'cde-datasets',
    templateUrl: './datasets.component.html',
})
export class DatasetsComponent {
    @Input() public elt!: DataElement;
}
