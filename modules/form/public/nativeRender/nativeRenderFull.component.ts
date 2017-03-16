import { Component, Input, OnInit } from "@angular/core";
import { NativeRenderService } from "./nativeRender.service";

@Component({
    selector: "cde-native-render-full",
    templateUrl: "./nativeRenderFull.component.html",
    providers: [NativeRenderService]
})
export class NativeRenderFullComponent implements OnInit {
    @Input() eltLoaded: any;
    @Input() elt: any;

    profileIndex: any;
    overridePrintable: boolean = true;

    constructor(public nativeRenderService: NativeRenderService) {
    }

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
        this.overridePrintable = this.elt.displayProfiles[this.profileIndex].displayType === this.nativeRenderService.FOLLOW_UP;
    }
}