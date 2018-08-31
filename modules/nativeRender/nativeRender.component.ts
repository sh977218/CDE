import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import './nativeRender.scss';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { CdeForm, DisplayProfile } from 'shared/form/form.model';
import { ScoreService } from 'nativeRender/score.service';

@Component({
    selector: 'cde-native-render',
    providers: [NativeRenderService],
    templateUrl: './nativeRender.component.html',
})
export class NativeRenderComponent implements OnInit {
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
                private ss: ScoreService,
                public nrs: NativeRenderService) {
        this.formUrl = window.location.href;
        this.endpointUrl = (<any>window).endpointUrl;
    }

    getEndpointUrl() {
        return this.sanitizer.bypassSecurityTrustUrl(this.endpointUrl);
    }

    ngOnInit(): void {
        this.ss.register(this.nrs.elt);
    }
}
