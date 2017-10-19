import { Component, HostListener, Input, OnInit } from '@angular/core';
import { NativeRenderService } from 'form/public/nativeRender/nativeRender.service';
import { CdeForm } from 'form/public/form.model';

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
        /*.bot-left:before {*/
            /*content: "";*/
            /*position: absolute;*/
            /*bottom: -3px;*/
            /*left: -3px;*/
        /*}*/
        /*.bot-left:after {*/
              /*content: "";*/
              /*position: absolute;*/
              /*top: -3px;*/
              /*left: -3px;*/
        /*}*/
        /*.bot-left:before {*/
            /*top: -3px;*/
            /*width: 3px;*/
            /*background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#000), to(transparent));*/
            /*background-image: -webkit-linear-gradient(#000, transparent);*/
            /*background-image: -moz-linear-gradient(#000, transparent);*/
            /*background-image: -o-linear-gradient(#000, transparent);*/
        /*}*/
        /*.bot-left:after {*/
            /*right: -3px;*/
            /*height: 3px;*/
            /*background-image: -webkit-gradient(linear, 0 0, 100% 0, from(#000), to(transparent));*/
            /*background-image: -webkit-linear-gradient(left, #000, transparent);*/
            /*background-image: -moz-linear-gradient(left, #000, transparent);*/
            /*background-image: -o-linear-gradient(left, #000, transparent);*/
        /*}*/
    `]
})
export class NativeRenderFullComponent {
    @Input() elt: CdeForm;

    constructor() {
        this.mobileView = window.innerWidth <= 800;
    }

    selectedProfileName;
    overridePrintable: boolean = true;
    NativeRenderService = NativeRenderService;

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.mobileView = window.innerWidth <= 800;
    }

    mobileView: Boolean = false;

    selectProfile(render, profileIndex) {
        this.selectedProfileName = this.elt.displayProfiles[profileIndex].name;
        render.setProfile(this.elt.displayProfiles[profileIndex]);
        this.overridePrintable = this.elt.displayProfiles[profileIndex].displayType === this.NativeRenderService.FOLLOW_UP;
    }


}