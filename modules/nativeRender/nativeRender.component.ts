import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { CdeForm, DisplayProfile } from 'shared/form/form.model';

@Component({
    selector: "cde-native-render",
    templateUrl: "./nativeRender.component.html",
    styles: [`
        :host >>> .form-check{
            margin-bottom: 0;
        }
        :host >>> .form-check-input > span,
        :host >>> .form-check-input input {
            vertical-align: middle;
        }
        :host >>> label .native-question-label {
            font-weight: 700;
        }
        :host >>> .form-horizontal {
            counter-reset: section;
        }
        :host >>> .form-horizontal .native-section .radio-inline,
        :host >>> .form-horizontal .native-section {
            padding-top: 0;
        }
        :host >>> label.input-group-addon {
            background-color: transparent;
            border-left: 1px solid #ccc;
            display: table-cell;
        }
        :host >>> .native-section-header {
            border-bottom: 1px solid #eee;
            margin-top: 10px;
            margin-bottom: 5px;
        }
        :host >>> .native-question-header {
            page-break-inside: avoid;
        }
        :host >>> .native-question-label {
            margin-bottom: 0;
        }
        :host >>> div.native-question-label {
            font-size: 14px;
            font-weight: 700;
        }
        :host >>> legend.native-question-label {
            font-size: 14px;
            font-weight: 700;
            border-bottom: 0;
        }
        :host >>> .native-question-label-number:before {
            counter-increment: section;
            content: counter(section) ". ";
        }
        :host >>> .native-question-answers {
            margin-bottom: 5px;
        }
        :host >>> div.row .native-question-oneline-l {
            float: left;
            margin-top: 6px;
            margin-right: 5px;
        }
        :host >>> div.row .native-question-oneline-r {
            overflow: hidden;
            min-width: 50%;
            margin-top: 1px;
            margin-bottom: 1px;
            margin-left: 6%;
        }
        :host >>> .native-box {
            padding-left: 6%;
            margin-top: 1px;
            margin-bottom: 1px;
        }
        :host >>> .native-value {
            color: #999;
            font-style: italic;
            font-weight: 900;
        }
        :host >>> .radio-inline,
        :host >>> .wordwrap {
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        :host >>> .native-instructions {
            margin-bottom: 5px;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        :host >>> .form-horizontal .native-table-cell.radio,
        :host >>> .form-horizontal .native-table-cell.checkbox,
        :host >>> .form-horizontal .native-table-cell.form-check-input {
            padding-top: 0;
        }
        :host >>> .native-table-cell {
            height: auto;
        }
        :host >>> .native-table-cell label {
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
    @Input() set submitForm(flag: boolean) {
        this.nrs.submitForm = flag;
        this.nrs.eltSet(this.nrs.elt);
    }
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
