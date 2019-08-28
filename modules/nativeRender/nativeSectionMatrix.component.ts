import { Component, Input } from '@angular/core';
import { NativeRenderService } from './nativeRender.service';
import { FormElement } from 'shared/form/form.model';

@Component({
    selector: 'cde-native-section-matrix',
    templateUrl: 'nativeSectionMatrix.component.html'
})
export class NativeSectionMatrixComponent {
    @Input() formElement!: FormElement;
    @Input() numSubQuestions!: number;
    NRS = NativeRenderService;

    constructor(public nrs: NativeRenderService) {
    }
}
