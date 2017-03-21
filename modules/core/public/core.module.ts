import { ModuleWithProviders, NgModule, Optional, SkipSelf } from "@angular/core";
import { NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";

import { CdeAmericanDateParserFormatter } from "./americanDateParserFormatter";
import { ClassificationService } from "./classification.service";
import { SkipLogicService } from "./skipLogic.service";


@NgModule({
    imports:      [  ],
    providers:    [
        {provide: NgbDateParserFormatter, useClass: CdeAmericanDateParserFormatter},
        ClassificationService,
        SkipLogicService,
    ]
})
export class CoreModule {
}