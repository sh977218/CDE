import { Component, Input } from '@angular/core';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { questionMulti } from 'shared/form/fe';
import { FormElementPart, FormElementsContainer, QuestionValueList } from 'shared/form/form.model';

@Component({
    selector: 'cde-native-section-matrix',
    templateUrl: 'nativeSectionMatrix.component.html'
})
export class NativeSectionMatrixComponent {
    @Input() formElement!: FormElementsContainer<FormElementPart & {elementType: 'question', question: QuestionValueList}>;
    @Input() numSubQuestions!: number;
    NRS = NativeRenderService;
    questionMulti = questionMulti;

    constructor(public nrs: NativeRenderService) {
    }
}
