import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CdeForm, DisplayProfile } from 'shared/form/form.model';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { SkipLogicService } from 'nativeRender/skipLogic.service';

@Component({
    selector: "cde-native-render",
    templateUrl: "./nativeRender.component.html",
    styles: [`
    :host >>> .form-check{
        margin-bottom: 0;
    }
    :host >>> label .native-question-label {
        font-weight: 700;
    }
    .form-horizontal {
        counter-reset: section;
    }
    .form-horizontal .native-section .radio-inline,
    .form-horizontal .native-section {
        padding-top: 0;
    }
    label.input-group-addon {
        background-color: transparent;
    }
    .native-section-header {
        border-bottom: 1px solid #eee;
        margin-top: 10px;
        margin-bottom: 5px;
    }
    .native-question-header {
        page-break-inside: avoid;
    }
    .native-question-label {
        margin-bottom: 0;
    }
    div.native-question-label {
        font-size: 14px;
        font-weight: 700;
    }
    legend.native-question-label {
        font-size: 14px;
        font-weight: 700;
        border-bottom: 0;
    }
    .native-question-label-number:before {
        counter-increment: section;
        content: counter(section) ". ";
    }
    .native-question-answers {
        margin-bottom: 5px;
    }
    div.row .native-question-oneline-l {
        float: left;
        margin-top: 6px;
        margin-right: 5px;
    }
    .native-box {
        padding-left: 6%;
        margin-top: 1px;
        margin-bottom: 1px;
    }
    .native-value {
        color: #999;
        font-style: italic;
        font-weight: 900;
    }
    .radio-inline,
    .wordwrap {
        word-wrap: break-word;
        overflow-wrap: break-word;
    }
    .native-instructions {
        margin-bottom: 5px;
        word-wrap: break-word;
        overflow-wrap: break-word;
    }
    .form-horizontal .native-table-cell.radio,
    .form-horizontal .native-table-cell.checkbox,
    .form-horizontal .native-table-cell.form-check-input {
        padding-top: 0;
    }
    .native-table-cell {
        height: auto;
    }
    .native-table-cell label {
        font-weight: normal;
        margin-bottom: 0;
    }
    `],
    providers: [NativeRenderService]
})
export class NativeRenderComponent {
    @Input() set elt(e: CdeForm) {
        this.nrs.eltSet(e);
    }
    @Input() set profile(p: DisplayProfile) {
        this.nrs.profileSet(p);
    }
    @Input() set nativeRenderType(userType) {
        this.nrs.nativeRenderType = userType;
    }
    @Input() submitForm: boolean;
    @Input() showTitle: boolean = true;
    endpointUrl: string;
    formUrl: string;
    readonly NRS = NativeRenderService;

    constructor(private sanitizer: DomSanitizer,
                public nrs: NativeRenderService) {
        this.formUrl = window.location.href;
        this.endpointUrl = (<any>window).endpointUrl;
    }

    getEndpointUrl() {
        return this.sanitizer.bypassSecurityTrustUrl(this.endpointUrl);
    }
}
