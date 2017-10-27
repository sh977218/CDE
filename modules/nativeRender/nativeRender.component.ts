import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CdeForm, DisplayProfile } from 'core/form.model';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { SkipLogicService } from 'nativeRender/skipLogic.service';

@Component({
    selector: "cde-native-render",
    templateUrl: "./nativeRender.component.html",
    providers: [NativeRenderService]
})
export class NativeRenderComponent {
    @Input() set elt(e: CdeForm) {
        let map = this.nrs.setElt(e);
        if (map)
            this.mapping = map;
    };
    @Input() set profile(p: DisplayProfile) {
        this.nrs.setSelectedProfile(p);
    };
    @Input() submitForm: boolean;
    @Input() showTitle: boolean = true;

    endpointUrl: string;
    formUrl: string;
    mapping: any;
    readonly NRS = NativeRenderService;

    constructor(private sanitizer: DomSanitizer,
                public skipLogicService: SkipLogicService,
                public nrs: NativeRenderService) {
        this.formUrl = window.location.href;
        this.endpointUrl = (<any>window).endpointUrl;
    }

    getEndpointUrl() {
        return this.sanitizer.bypassSecurityTrustUrl(this.endpointUrl);
    }

    setNativeRenderType(userType) {
        this.nrs.setNativeRenderType(userType);
    }
}
