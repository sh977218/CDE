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
export class NativeRenderComponent implements OnChanges {
    _profile: DisplayProfile;

    @Input() elt: CdeForm;

    @Input() set profile(p : DisplayProfile) {
        this.nativeRenderService.setElt(this.elt);
        this._profile = p;
        this.nativeRenderService.profile = p;
        this.nativeRenderService.setSelectedProfile();
    };
    get profile(): DisplayProfile {
        return this._profile;
    };

    @Input() submitForm: boolean;
    @Input() showTitle: boolean = true;

    endpointUrl: string;
    formUrl: string;
    mapping: any;
    NativeRenderService = NativeRenderService;

    constructor(private sanitizer: DomSanitizer,
                public skipLogicService: SkipLogicService,
                public nativeRenderService: NativeRenderService) {
        this.formUrl = window.location.href;
        this.endpointUrl = (<any>window).endpointUrl;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.elt && changes.elt.currentValue)
            this.load();
    }

    private load() {
        this.nativeRenderService.setElt(this.elt);
        this.mapping = JSON.stringify({sections: NativeRenderService.flattenForm(this.elt)});
        this.nativeRenderService.setSelectedProfile(this.profile);

        if (!this.nativeRenderService.elt.formInput)
            this.nativeRenderService.elt.formInput = [];
    }

    getEndpointUrl() {
        return this.sanitizer.bypassSecurityTrustUrl(this.endpointUrl);
    }

    setNativeRenderType(userType) {
        this.nativeRenderService.setNativeRenderType(userType);
    }
}
