import { Component, Input, OnInit } from '@angular/core';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { CdeForm, DisplayProfile } from 'shared/form/form.model';

@Component({
    selector: 'cde-native-render-full',
    templateUrl: './nativeRenderFull.component.html',
    styles: [`
     @media print {
        @page {
            size: 330mm 427mm;
            margin: 14mm;
        }
        .container {
            width: 1170px;
        }
        .keep-with-previous {
            page-break-before: avoid;
            break-before: avoid;
        }
        .keep-together {
            page-break-inside: avoid;
            break-inside: avoid;
        }
    }
    @media (min-width: 768px) {
        .bot-left {
            position: relative;
            margin: auto;
            margin-top: 5px;
            max-width: 1032px;
            border-radius: 20px;
            border: solid lightgrey 3px;
            overflow-x: auto;
        }
        .noGridPadLarge {
            padding-left: 0;
            padding-right: 0;
        }
    }
    @media (max-width: 767px) {
        .noGridPadSmall {
            padding-left: 5px;
            padding-right: 5px;
        }
    }
    `]
})
export class NativeRenderFullComponent implements OnInit {
    @Input() elt!: CdeForm;
    profile?: DisplayProfile;
    selectedProfileName?: string;
    selectedProfileNameDecode?: string;
    overridePrintable = true;
    NativeRenderService = NativeRenderService;

    ngOnInit() {
        if (this.elt.displayProfiles.length) { this.selectProfile(0); }
    }

    selectProfile(profileIndex: number) {
        this.profile = this.elt.displayProfiles[profileIndex];
        this.selectedProfileName = this.elt.displayProfiles[profileIndex].name;
        this.selectedProfileNameDecode = decodeURIComponent(this.selectedProfileName);
        this.overridePrintable = this.elt.displayProfiles[profileIndex].displayType === this.NativeRenderService.FOLLOW_UP;
    }
}
