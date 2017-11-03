import { Component, HostListener, Input, OnInit } from '@angular/core';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { CdeForm, DisplayProfile } from 'core/form.model';

@Component({
    selector: "cde-native-render-full",
    templateUrl: "./nativeRenderFull.component.html",
    styles: [`
        .bot-left {
            position: relative;
            margin: auto;
            padding: 10px 10px;
            margin-top: 5px;
            max-width: 900px;
            border-radius: 20px;
            border: solid lightgrey 3px;
        }
    `]
})
export class NativeRenderFullComponent {
    @Input() elt: CdeForm;

    constructor() {
        this.mobileView = window.innerWidth <= 800;
    }

    profile: DisplayProfile;
    selectedProfileName;
    overridePrintable: boolean = true;
    NativeRenderService = NativeRenderService;

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.mobileView = window.innerWidth <= 800;
    }

    mobileView: Boolean = false;

    selectProfile(profileIndex) {
        this.profile = this.elt.displayProfiles[profileIndex];
        this.selectedProfileName = this.elt.displayProfiles[profileIndex].name;
        this.overridePrintable = this.elt.displayProfiles[profileIndex].displayType === this.NativeRenderService.FOLLOW_UP;
    }
}