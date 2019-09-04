import { Component, Input } from '@angular/core';
import { NativeRenderService } from './nativeRender.service';
import { FormElementPart, FormElementsContainer, QuestionValueList } from 'shared/form/form.model';

@Component({
    selector: 'cde-native-section-matrix',
    templateUrl: 'nativeSectionMatrix.component.html'
})
export class NativeSectionMatrixComponent {
    @Input() formElement!: FormElementsContainer<FormElementPart & {elementType: 'question', question: QuestionValueList}>;
    @Input() numSubQuestions!: number;
    NRS = NativeRenderService;

    constructor(public nrs: NativeRenderService) {
    }
}
