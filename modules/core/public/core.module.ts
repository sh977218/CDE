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
import { SharedService } from "./shared.service";
import { CompareService } from "./compare.service";
import { OrgHelperService } from "./orgHelper.service";
import { TourService } from "./tour.service";

export { CdeAmericanDateParserFormatter } from "./americanDateParserFormatter";
export { ClassificationService } from "./classification.service";

export function getUserResourceFactory(i: any) {
    return i.get("userResource");
}

export function getSearchSettingsFactory(i: any) {
    return i.get("SearchSettings");
}

export function getIsAllowedModelFactory(i: any) {
    return i.get("isAllowedModel");
}

export function getQuickBoardFactory(i: any) {
    return i.get("QuickBoard");
}

export function getFormQuickBoardFactory(i: any) {
    return i.get("FormQuickBoard");
}

export function getAccountManagementFactory(i: any) {
    return i.get("AccountManagement");
}

export function getPinModalFactory(i: any) {
    return i.get("PinModal");
}

export function getElasticBoardFactory(i: any) {
    return i.get("ElasticBoard");
}

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
        MergeCdeService,
        MergeFormService,
        MergeShareService,
        CompareService,
        OrgHelperService,
        // upgraded
        UpgradeModule,
        {provide: "userResource", useFactory: getUserResourceFactory, deps: ["$injector"]},
        {provide: "SearchSettings", useFactory: getSearchSettingsFactory, deps: ["$injector"]},
        {provide: "isAllowedModel", useFactory: getIsAllowedModelFactory, deps: ["$injector"]},
        {provide: "QuickBoard", useFactory: getQuickBoardFactory, deps: ["$injector"]},
        {provide: "FormQuickBoard", useFactory: getFormQuickBoardFactory, deps: ["$injector"]},
        {provide: "AccountManagement", useFactory: getAccountManagementFactory, deps: ["$injector"]},
        {provide: "PinModal", useFactory: getPinModalFactory, deps: ["$injector"]},
        {provide: "ElasticBoard", useFactory: getElasticBoardFactory, deps: ["$injector"]},
    ],
    exports: [
        Select2Module,
        JsonpModule
    ]
})
export class CoreModule {
}
