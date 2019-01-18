import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TextTruncateComponent } from 'textTruncate/textTruncate.component';

@NgModule({
    imports: [CommonModule],
    declarations: [TextTruncateComponent],
    exports: [TextTruncateComponent],
    providers: [],
    schemas: []
})

export class TextTruncateModule {
}
