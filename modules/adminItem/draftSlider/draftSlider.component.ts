import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import './draftSlider.global.scss';
import ToggleSwitch from 'js-toggle-switch/dist/toggle-switch';

@Component({
    selector: 'cde-draft-slider',
    template: `<span #sliderParent><input #sliderInput title="draft toggle" type="checkbox"></span>`,
})
export class DraftSliderComponent implements OnInit {
    @Input() set isDraft(isDraft: boolean) {
        if (isDraft !== undefined && isDraft !== this.draftSliderElem.nativeElement.checked) {
            setTimeout(() => { this.draftToggle.toggle(); }, 100);
        }
    }
    @Output() isDraftChange = new EventEmitter<boolean>();
    @ViewChild('sliderInput', {static: true}) draftSliderElem!: ElementRef;
    @ViewChild('sliderParent', {static: true}) draftSliderParent!: ElementRef;
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
