import { Component, HostListener, Input, OnInit } from '@angular/core';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { CdeForm, DisplayProfile } from 'core/form.model';

@Component({
    selector: "cde-native-render-full",
    templateUrl: "./nativeRenderFull.component.html",
    styles: [`
        @media (min-width: 768px) {
            .bot-left {
                position: relative;
                margin: auto;
                padding: 10px 10px;
                margin-top: 5px;
                max-width: 900px;
                border-radius: 20px;
                border: solid lightgrey 3px;
            }
            .noGridPadLarge {
                padding-left: 0;
                padding-right: 0;
            }
        }
        @media (max-width: 767px) {
            .noGridPadSmall {
                padding-left: 2px;
                padding-right: 2px;
            }
        }
    `]
})
export class NativeRenderFullComponent {
    @Input() elt: CdeForm;

    constructor() {
    }

    profile: DisplayProfile;
    selectedProfileName;
    overridePrintable: boolean = true;
    NativeRenderService = NativeRenderService;


    selectProfile(profileIndex) {
        this.profile = this.elt.displayProfiles[profileIndex];
        this.selectedProfileName = this.elt.displayProfiles[profileIndex].name;
        this.overridePrintable = this.elt.displayProfiles[profileIndex].displayType === this.NativeRenderService.FOLLOW_UP;
    }
}