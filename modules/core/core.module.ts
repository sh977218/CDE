import { NgModule } from "@angular/core";

import { ClassificationService } from "./classification.service";
import { ElasticService } from 'core/elastic.service';
import { ExportService } from "./export.service";
import { MergeCdeService } from "./mergeCde.service";
import { MergeFormService } from "./mergeForm.service";
import { MergeShareService } from "./mergeShare.service";
import { CompareService } from "./compare.service";
import { OrgHelperService } from "./orgHelper.service";
import { UserService } from "./user.service";
import { IsAllowedService } from 'core/isAllowed.service';
export { ClassificationService } from "./classification.service";

@NgModule({
    imports: [
    ],
    providers: [
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
    ],
    exports: [
    ]
})
export class CoreModule {
}
