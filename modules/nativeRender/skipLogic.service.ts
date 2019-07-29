import { ErrorHandler, Injectable } from '@angular/core';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { isQuestion } from 'core/form/fe';
import { FormElement } from 'shared/form/form.model';
import { evaluateSkipLogic } from 'core/form/skipLogic';

@Injectable()
export class SkipLogicService {
    constructor(private errorHandler: ErrorHandler) {
    }

    evalSkipLogic(parent: FormElement, fe: FormElement, nrs: NativeRenderService): boolean {
        try {
            return evaluateSkipLogic(fe.skipLogic ? fe.skipLogic.condition : undefined, parent, fe, nrs.addError.bind(nrs));
        } catch (error) {
            this.errorHandler.handleError({
                name: 'Skip Logic Evaluation Error: ' + (fe.skipLogic && fe.skipLogic.condition),
                message: error.message,
                stack: error.stack
            });
            return true;
        }
    }

    evalSkipLogicAndClear(parent: FormElement, fe: FormElement, nrs: NativeRenderService): boolean {
        const skipLogicResult = this.evalSkipLogic(parent, fe, nrs);
        if (!skipLogicResult && isQuestion(fe)) { fe.question.answer = undefined; }
        return skipLogicResult;
    }
}
