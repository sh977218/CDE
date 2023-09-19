import { NgModule } from '@angular/core';
import { ClassificationService } from 'non-core/classification.service';
import { ExportService } from 'non-core/export.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { PlaceHoldEmptyPipe } from 'non-core/pipes/placeHoldEmpty.pipe';
import { SafeHtmlPipe } from 'non-core/pipes/safeHtml.pipe';
import { RegistrationValidatorService } from 'non-core/registrationValidator.service';
import { PluckPipe } from 'non-core/pipes/pluck.pipe';

@NgModule({
    imports: [],
    declarations: [PlaceHoldEmptyPipe, SafeHtmlPipe, PluckPipe],
    exports: [PlaceHoldEmptyPipe, SafeHtmlPipe, PluckPipe],
    providers: [ClassificationService, ExportService, IsAllowedService, RegistrationValidatorService],
})
export class NonCoreModule {}
