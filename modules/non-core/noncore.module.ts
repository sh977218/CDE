import { NgModule } from '@angular/core';
import { ClassificationService } from 'non-core/classification.service';
import { ExportService } from 'non-core/export.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { RegistrationValidatorService } from 'non-core/registrationValidator.service';
import { PlaceHoldEmptyPipe } from 'non-core/pipes/placeHoldEmpty.pipe';
import { SafeHtmlPipe } from 'non-core/pipes/safeHtml.pipe';

@NgModule({
    imports: [],
    declarations: [PlaceHoldEmptyPipe, SafeHtmlPipe],
    providers: [
        ClassificationService,
        ExportService,
        IsAllowedService,
        RegistrationValidatorService
    ],
    exports: [PlaceHoldEmptyPipe, SafeHtmlPipe]
})
export class NonCoreModule {
}
