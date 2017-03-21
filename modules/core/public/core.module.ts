import { ModuleWithProviders, NgModule, Optional, SkipSelf } from "@angular/core";
import { NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";

import { CdeAmericanDateParserFormatter } from "./americanDateParserFormatter";
import { ClassificationService } from "./classification.service";
import { SkipLogicService } from "./skipLogic.service";

export { CdeAmericanDateParserFormatter } from "./americanDateParserFormatter";
export { ClassificationService } from "./classification.service";
export { SkipLogicService } from "./skipLogic.service";


@NgModule({
    providers:    [
        {provide: NgbDateParserFormatter, useClass: CdeAmericanDateParserFormatter},
        ClassificationService,
        SkipLogicService,
    ]
})
export class CoreModule {
    constructor (@Optional() @SkipSelf() parentModule: CoreModule) {
        if (parentModule) {
            throw new Error(
                "CoreModule is already loaded. Import it in the AppModule only.");
        }
    }
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: CoreModule,
            providers: []
        };
    }
}