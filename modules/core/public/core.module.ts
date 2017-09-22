import { NgModule } from "@angular/core";
import { JsonpModule } from "@angular/http";
import { UpgradeModule } from "@angular/upgrade/static";
import { NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";
import { Select2Module } from "ng2-select2";

import { CdeAmericanDateParserFormatter } from "./americanDateParserFormatter";
import { ClassificationService } from "./classification.service";
import { ElasticService } from 'core/public/elastic.service';
import { ExportService } from "./export.service";
import { MergeCdeService } from "./mergeCde.service";
import { MergeFormService } from "./mergeForm.service";
import { MergeShareService } from "./mergeShare.service";
import { CompareService } from "./compare.service";
import { OrgHelperService } from "./orgHelper.service";
import { UserService } from "./user.service";
import { IsAllowedService } from 'core/public/isAllowed.service';

export { CdeAmericanDateParserFormatter } from "./americanDateParserFormatter";
export { ClassificationService } from "./classification.service";

@NgModule({
    imports: [
        Select2Module,
        JsonpModule
    ],
    providers: [
        {provide: NgbDateParserFormatter, useClass: CdeAmericanDateParserFormatter},
        ClassificationService,
        ElasticService,
        ExportService,
        IsAllowedService,
        MergeCdeService,
        MergeFormService,
        MergeShareService,
        CompareService,
        OrgHelperService,
        UserService,
        // upgraded
        UpgradeModule,
    ],
    exports: [
        Select2Module,
        JsonpModule
    ]
})
export class CoreModule {
}
