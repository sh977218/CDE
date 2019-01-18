import { NgModule } from '@angular/core';

import { ClassificationService } from './classification.service';
import { ExportService } from 'core/export.service';
import { MergeCdeService } from 'core/mergeCde.service';
import { MergeFormService } from 'core/mergeForm.service';
import { MergeShareService } from 'core/mergeShare.service';
import { CompareService } from 'core/compare.service';
import { IsAllowedService } from 'core/isAllowed.service';
import { RegistrationValidatorService } from 'core/registrationValidator.service';
import { PlaceHoldEmptyPipe } from 'core/pipes/placeHoldEmpty.pipe';

@NgModule({
    imports: [],
    declarations: [PlaceHoldEmptyPipe],
    providers: [
        ClassificationService,
        CompareService,
        ExportService,
        IsAllowedService,
        MergeCdeService,
        MergeFormService,
        MergeShareService,
        RegistrationValidatorService
    ],
    exports: [PlaceHoldEmptyPipe]
})
export class CoreModule {
}
