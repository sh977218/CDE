import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ScrollService } from 'angular-aio-toc/scroll.service';
import { ScrollSpyService } from 'angular-aio-toc/scroll-spy.service';
import { TocComponent } from 'angular-aio-toc/toc.component';

@NgModule({
    imports: [CommonModule, MatIconModule],
    declarations: [TocComponent],
    providers: [ScrollService, ScrollSpyService],
    exports: [TocComponent],
})
export class TocModule {}
