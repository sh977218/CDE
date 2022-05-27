import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TextTruncateComponent } from 'textTruncate/textTruncate.component';
import { NonCoreModule } from 'non-core/noncore.module';

@NgModule({
    imports: [
        CommonModule,
        NonCoreModule,
    ],
    declarations: [TextTruncateComponent],
    exports: [TextTruncateComponent],
    providers: [],
    schemas: []
})

export class TextTruncateModule {
}
