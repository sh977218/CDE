import { ErrorHandler, Injectable } from '@angular/core';
import { evaluateSkipLogic } from 'core/form/skipLogic';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { isQuestion } from 'shared/form/fe';
import { FormElement, FormElementsContainer } from 'shared/form/form.model';

@Injectable({ providedIn: 'root' })
export class SkipLogicService {
    constructor(private errorHandler: ErrorHandler) {}

    evalSkipLogic(parent: FormElementsContainer, fe: FormElement, nrs: NativeRenderService): boolean {
        try {
            return evaluateSkipLogic(
                fe.skipLogic ? fe.skipLogic.condition : undefined,
                parent,
                fe,
                nrs.addError.bind(nrs)
            );
        } catch (error: any) {
            this.errorHandler.handleError({
                name: 'Skip Logic Evaluation Error: ' + (fe.skipLogic && fe.skipLogic.condition),
                message: error.message,
                stack: error.stack,
            });
            return true;
        }
    }

    evalSkipLogicAndClear(parent: FormElementsContainer, fe: FormElement, nrs: NativeRenderService): boolean {
        const skipLogicResult = this.evalSkipLogic(parent, fe, nrs);
        if (!skipLogicResult && isQuestion(fe)) {
            fe.question.answer = undefined;
        }
        return skipLogicResult;
    }
}
