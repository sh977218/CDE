import { Component, Input, OnInit } from "@angular/core";
import { NativeRenderService } from "./nativeRender.service";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
    selector: "cde-native-render",
    templateUrl: "./nativeRender.component.html",
    providers: [NativeRenderService]
})
export class NativeRenderComponent implements OnInit {
    @Input() eltLoaded: any;
    @Input() elt: any;
    @Input() profile: any;
    @Input() submitForm: string;

    endpointUrl: string;
    formUrl: string;
    mapping: any;

    constructor(private sanitizer: DomSanitizer,
                public nativeRenderService: NativeRenderService) {
        this.formUrl = window.location.href;
        this.endpointUrl = (<any>window).endpointUrl;
    }

    ngOnInit() {
        if (this.eltLoaded)
            this.eltLoaded.promise.then(() => {
                this.load();
            });
        else
            this.load();
    }
    private load() {
        this.nativeRenderService.elt = this.elt;
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
