import { NgModule } from '@angular/core';
import { ClassificationService } from 'core/classification.service';
import { ExportService } from 'core/export.service';
import { MergeCdeService } from 'core/mergeCde.service';
import { MergeFormService } from 'core/mergeForm.service';
import { IsAllowedService } from 'core/isAllowed.service';
import { RegistrationValidatorService } from 'core/registrationValidator.service';
import { PlaceHoldEmptyPipe } from 'core/pipes/placeHoldEmpty.pipe';

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
export class CoreModule {
}
