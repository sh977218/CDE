import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import '../../../../node_modules/js-toggle-switch/dist/toggle-switch.css';
import ToggleSwitch from 'js-toggle-switch/dist/toggle-switch';


@Component({
    selector: 'cde-draft-slider',
    template: `<span #sliderParent><input #sliderInput title="draft toggle" type="checkbox"></span>`,
    styles: [`
        :host >>> .toggle-switch {
            height: 38px;
            margin-bottom: -6px;
            min-width: 108px;
        }

        :host >>> .toggle-switch__tongue {
            color: #fff;
            font-size: 16px;
            font-weight: 700;
            margin: 1px 2px 0;
            text-shadow: none;
            text-transform: none;
            width: 87px;
        }

        :host >>> .toggle-switch--on > .toggle-switch__tongue {
            background-color: #5bc0de;
            border-color: #46b8da;
        }

        :host >>> .toggle-switch--on:hover > .toggle-switch__tongue {
            background-color: #31b0d5;
            border-color: #269abc;
        }

        :host >>> .toggle-switch--on > .toggle-switch__tongue {
            margin-left: -89px;
        }

        :host >>> .toggle-switch--off > .toggle-switch__tongue {
            background-color: #5cb85c;
            border-color: #4cae4c;
        }

        :host >>> .toggle-switch--off:hover > .toggle-switch__tongue {
            background-color: #449d44;
            border-color: #398439;
        }

        @media (max-width: 767px)  {
            :host >>> .toggle-switch {
                height: 28px;
                margin-bottom: -6px;
                min-width: 92px;
            }

            :host >>> .toggle-switch__tongue {
                font-size: 14px;
                height: 24px;
                line-height: 23px;
                margin: 1px 2px 0;
                width: 76px;
            }

            :host >>> .toggle-switch--on > .toggle-switch__tongue {
                margin-left: -78px;
            }
        }
    `]
})
export class DraftSliderComponent implements OnInit {
    @Input() set isDraft(isDraft: boolean) {
        if (isDraft !== undefined && isDraft !== this.draftSliderElem.nativeElement.checked) {
            setTimeout(() => { this.draftToggle.toggle(); }, 100);
        }
    }
    @Output() isDraftChange = new EventEmitter<boolean>();
    @ViewChild('sliderInput') draftSliderElem!: ElementRef;
    @ViewChild('sliderParent') draftSliderParent!: ElementRef;
    draftToggle: any;

    ngOnInit() {
        this.draftToggle = new ToggleSwitch(this.draftSliderElem.nativeElement,
            {onLabel: 'DRAFT', offLabel: 'Published'});
        this.draftSliderParent.nativeElement.children[0].addEventListener('click', () => {
            this.isDraftChange.emit(this.draftSliderElem.nativeElement.checked);
        });
    }

    constructor() {}
}
