import { Component, Input } from '@angular/core';

@Component({
    selector: 'cde-cde-general-details',
    templateUrl: './cdeGeneralDetails.component.html'
})
export class CdeGeneralDetailsComponent {
    @Input() elt: any;
}
