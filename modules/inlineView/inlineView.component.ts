import { Component, Input } from '@angular/core';
import { assertUnreachable } from 'shared/models.model';

type InputTypes = 'date' | 'email' | 'number' | 'select' | 'text' | 'textArea';

@Component({
    selector: 'cde-inline-view[value]',
    template: `
        <a *ngIf="linkSource; else displayText" href="{{ linkSource }}" target="_blank" rel="noopener noreferrer">{{
            value
        }}</a>
        <ng-template #displayText>
            <span>{{ isNotNA(value) ? value : '' }}</span>
        </ng-template>
    `,
})
export class InlineViewComponent {
    @Input() inputType: InputTypes = 'text';
    @Input() linkSource?: string;
    @Input() value!: string | number;

    isNotNA(value: any): boolean {
        switch (this.inputType) {
            case 'number':
                return !isNaN(value);
            case 'date':
            case 'email':
            case 'select':
            case 'text':
            case 'textArea':
                return !!value;
            default:
                throw assertUnreachable(this.inputType);
        }
    }
}
