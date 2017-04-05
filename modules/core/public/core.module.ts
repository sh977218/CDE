import { ModuleWithProviders, NgModule, Optional, SkipSelf } from "@angular/core";
import { NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";

import { CdeAmericanDateParserFormatter } from "./americanDateParserFormatter";
import { ClassificationService } from "./classification.service";
import { SkipLogicService } from "./skipLogic.service";
import { MergeCdeService } from "./mergeCde.service";
import { MergeFormService } from "./mergeForm.service";
import { MergeShareService } from "./mergeShare.service";
import { UpgradeModule } from "@angular/upgrade/static";

export { CdeAmericanDateParserFormatter } from "./americanDateParserFormatter";
export { ClassificationService } from "./classification.service";
export { SkipLogicService } from "./skipLogic.service";

export function getAlertFactory(i: any) { return i.get("Alert"); }
export function getUserResourceFactory(i: any) { return i.get("userResource"); }
export function getViewingHistoryFactory(i: any) { return i.get("ViewingHistory"); }
export function getIsAllowedModelFactory(i: any) { return i.get("isAllowedModel"); }
export function getQuickBoardFactory(i: any) { return i.get("QuickBoard"); }
export function getAccountManagementFactory(i: any) { return i.get("AccountManagement"); }
export function getFormQuickBoardFactory(i: any) { return i.get("FormQuickBoard"); }
export function getPinModalFactory(i: any) { return i.get("PinModal"); }
export function getElasticFactory(i: any) { return i.get("Elastic"); }

@NgModule({
    providers:    [
        {provide: NgbDateParserFormatter, useClass: CdeAmericanDateParserFormatter},
        ClassificationService,
        MergeCdeService,
        MergeFormService,
        MergeShareService,
        SkipLogicService,
        // upgraded
        UpgradeModule,
        {provide: "Alert", useFactory: getAlertFactory, deps: ["$injector"]},
        {provide: "userResource", useFactory: getUserResourceFactory, deps: ["$injector"]},
        {provide: "ViewingHistory", useFactory: getViewingHistoryFactory, deps: ["$injector"]},
        {provide: "isAllowedModel", useFactory: getIsAllowedModelFactory, deps: ["$injector"]},
        {provide: "QuickBoard", useFactory: getQuickBoardFactory, deps: ["$injector"]},
        {provide: "AccountManagement", useFactory: getAccountManagementFactory, deps: ["$injector"]},
        {provide: "FormQuickBoard", useFactory: getFormQuickBoardFactory, deps: ["$injector"]},
        {provide: "PinModal", useFactory: getPinModalFactory, deps: ["$injector"]},
        {provide: "Elastic", useFactory: getElasticFactory, deps: ["$injector"]},
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