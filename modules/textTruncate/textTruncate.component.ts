import { Component, Input } from '@angular/core';

@Component({
    selector: 'cde-text-truncate',
    templateUrl: './textTruncate.component.html',
    styles: [
        `
            .collapseText {
                display: block;
                overflow: hidden;
                max-height: 165px;
                box-shadow: 0 9px 7px -5px #969696;
            }

            .expandText {
                overflow: hidden;
                display: inline-block;
            }
        `,
    ],
})
export class TextTruncateComponent {
    @Input() text!: string;
    @Input() textType: string = 'plainText';
    @Input() enableTextTruncate = true;
    @Input() threshold: number = 500;
    @Input() customMoreLabel!: string;
    @Input() customLessLabel!: string;
    @Input() bypassSanitize = false;
    _class: string = 'collapseText';
    open: boolean = false;

    toggleShow(): void {
        this.open = !this.open;
        this._class =
            this._class === 'collapseText' ? 'expandText' : 'collapseText';
    }
}
