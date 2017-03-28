import { ModuleWithProviders, NgModule } from "@angular/core";
import { NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";

import { CdeAmericanDateParserFormatter } from "./americanDateParserFormatter";
import { ClassificationService } from "./classification.service";
import { SkipLogicService } from "./skipLogic.service";
import { MergeCdeService } from "./mergeCde.service";
import { MergeFormService } from "./mergeForm.service";
import { MergeShareService } from "./mergeShare.service";

export { CdeAmericanDateParserFormatter } from "./americanDateParserFormatter";
export { ClassificationService } from "./classification.service";
export { SkipLogicService } from "./skipLogic.service";

@NgModule({
    providers:    [
        {provide: NgbDateParserFormatter, useClass: CdeAmericanDateParserFormatter},
        ClassificationService,
        MergeCdeService,
        MergeFormService,
        MergeShareService,
        SkipLogicService
    ]
})
export class CoreModule {
}