import { NgModule } from '@angular/core';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

import { CdeAmericanDateParserFormatter } from 'core/americanDateParserFormatter';
import { ClassificationService } from './classification.service';
import { ExportService } from 'core/export.service';
import { MergeCdeService } from 'core/mergeCde.service';
import { MergeFormService } from 'core/mergeForm.service';
import { MergeShareService } from 'core/mergeShare.service';
import { CompareService } from 'core/compare.service';
import { OrgHelperService } from 'core/orgHelper.service';
import { IsAllowedService } from 'core/isAllowed.service';
import { RegistrationValidatorService } from 'core/registrationValidator.service';

@NgModule({
    imports: [
    ],
    providers: [
        ClassificationService,
        CompareService,
        ExportService,
        IsAllowedService,
        MergeCdeService,
        MergeFormService,
        MergeShareService,
        {provide: NgbDateParserFormatter, useClass: CdeAmericanDateParserFormatter},
        OrgHelperService,
        RegistrationValidatorService,
    ],
    exports: [
    ]
})
export class CoreModule {
}
