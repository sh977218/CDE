import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CdeForm, DisplayProfile } from 'form/public/form.model';
import { NativeRenderService } from 'form/public/nativeRender/nativeRender.service';
import { SkipLogicService } from 'form/public/skipLogic.service';

@Component({
    selector: "cde-native-render",
    templateUrl: "./nativeRender.component.html",
    providers: [NativeRenderService]
})
export class NativeRenderComponent implements OnChanges {
    @Input() elt: CdeForm;
    @Input() profile: DisplayProfile;
    @Input() submitForm: boolean;

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
        if (changes.elt)
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

    setProfile(profile) {
        this.nativeRenderService.profile = profile;
        this.nativeRenderService.setSelectedProfile();
    }

    setNativeRenderType(userType) {
        this.nativeRenderService.setNativeRenderType(userType);
    }
}
