import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TextTruncateComponent } from 'textTruncate/textTruncate.component';
import { NonCoreModule } from 'non-core/noncore.module';
import { SafeHtmlPipe } from '../non-core/pipes/safeHtml.pipe';

@NgModule({
    imports: [CommonModule, NonCoreModule, SafeHtmlPipe],
    declarations: [TextTruncateComponent],
    exports: [TextTruncateComponent],
    providers: [],
    schemas: [],
})
export class TextTruncateModule {}
