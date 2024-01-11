import { PipeTransform, Pipe } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'cdeSafeHtml', standalone: true })
export class SafeHtmlPipe implements PipeTransform {
    constructor(private sanitized: DomSanitizer) {}

    transform(value: string) {
        return this.sanitized.bypassSecurityTrustHtml(value);
    }
}
