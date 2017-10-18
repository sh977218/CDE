import { Component, Input, OnInit } from '@angular/core';
import { NativeRenderService } from 'form/public/nativeRender/nativeRender.service';
import { CdeForm } from 'form/public/form.model';

@Component({
    selector: "cde-native-render-full",
    templateUrl: "./nativeRenderFull.component.html"
})
export class NativeRenderFullComponent {
    @Input() elt: CdeForm;

    selectedProfileName;
    overridePrintable: boolean = true;
    NativeRenderService = NativeRenderService;

    selectProfile(render, profileIndex) {
        this.selectedProfileName = this.elt.displayProfiles[profileIndex].name;
        render.setProfile(this.elt.displayProfiles[profileIndex]);
        this.overridePrintable = this.elt.displayProfiles[profileIndex].displayType === this.NativeRenderService.FOLLOW_UP;
    }
}