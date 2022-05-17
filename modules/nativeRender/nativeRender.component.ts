import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import 'nativeRender/nativeRender.global.scss';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { CdeForm, DisplayProfile, DisplayType } from 'shared/form/form.model';
import { ScoreService } from 'nativeRender/score.service';
import { environment } from 'environments/environment';

@Component({
    selector: 'cde-native-render',
    providers: [NativeRenderService, ScoreService],
    templateUrl: './nativeRender.component.html',
})
export class NativeRenderComponent {
    @Input() set elt(e: CdeForm) {
        this.nrs.eltSet(e);
    }

    @Input() set profile(p: DisplayProfile) {
        this.nrs.profileSet(p);
    }

    @Input() set nativeRenderType(userType: DisplayType) {
        this.nrs.nativeRenderType = userType;
    }

    @Input() set submitForm(flag: boolean) {
        this.nrs.submitForm = flag;
        this.nrs.eltSet(this.nrs.elt);
    }

    @Input() showTitle = true;
    endpointUrl: string = environment.endpointUrl;
    formUrl: string;
    readonly NRS = NativeRenderService;

    constructor(private sanitizer: DomSanitizer,
                public nrs: NativeRenderService) {
        this.formUrl = window.location.href;
    }

    getEndpointUrl() {
        return this.sanitizer.bypassSecurityTrustUrl(this.endpointUrl);
    }
}
