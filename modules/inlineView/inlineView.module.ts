import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InlineViewComponent } from 'inlineView/inlineView.component';

@NgModule({
    imports: [CommonModule],
    declarations: [InlineViewComponent],
    exports: [InlineViewComponent],
    providers: [],
})
export class InlineViewModule {}
