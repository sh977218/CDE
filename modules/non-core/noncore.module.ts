import { NgModule } from '@angular/core';
import { ClassificationService } from 'non-core/classification.service';
import { ExportService } from 'non-core/export.service';
import { MergeCdeService } from 'non-core/mergeCde.service';
import { MergeFormService } from 'non-core/mergeForm.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { RegistrationValidatorService } from 'non-core/registrationValidator.service';
import { PlaceHoldEmptyPipe } from 'non-core/pipes/placeHoldEmpty.pipe';

@NgModule({
    imports: [],
    declarations: [PlaceHoldEmptyPipe],
    providers: [
        ClassificationService,
        ExportService,
        IsAllowedService,
        MergeCdeService,
        MergeFormService,
        RegistrationValidatorService
    ],
    exports: [PlaceHoldEmptyPipe]
})
export class NonCoreModule {
}