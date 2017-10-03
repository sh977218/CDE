import { Component, Input, OnInit } from '@angular/core';
import { NativeRenderService } from 'form/public/nativeRender/nativeRender.service';
import { CdeForm } from 'form/public/form.model';

@Component({
    selector: "cde-native-render-full",
    templateUrl: "./nativeRenderFull.component.html"
})
export class NativeRenderFullComponent implements OnInit {
    @Input() elt: CdeForm;

    profileIndex: any;
    overridePrintable: boolean = true;
    NativeRenderService = NativeRenderService;

    constructor() {}

    ngOnInit() {
        if (this.profileIndex == null && this.elt.displayProfiles.length) {
            this.profileIndex = 0;
            this.setOverride();
        }
    }

    selectProfile(render) {
        render.setProfile(this.elt.displayProfiles[this.profileIndex]);
        this.setOverride();
    }

    setOverride() {
        this.overridePrintable = this.elt.displayProfiles[this.profileIndex].displayType === this.NativeRenderService.FOLLOW_UP;
    }
}