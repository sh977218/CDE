import { ErrorHandler, Injectable } from '@angular/core';

import { evaluateSkipLogic } from 'shared/form/skipLogic';


@Injectable()
export class SkipLogicService {
    constructor(private errorHandler: ErrorHandler) {}

    evalSkipLogic(parent, fe, nrs) {
        try {
            return evaluateSkipLogic(fe.skipLogic ? fe.skipLogic.condition : null, parent, fe, nrs);
        } catch (error) {
            this.errorHandler.handleError({
                name: 'Skip Logic Evaluation Error',
                message: error.message,
                stack: error.stack
            });
            return true;
        }
    }

    evalSkipLogicAndClear(parent, fe, nrs) {
        let skipLogicResult = this.evalSkipLogic(parent, fe, nrs);
        if (!skipLogicResult && fe.question) fe.question.answer = undefined;
        return skipLogicResult;
    }
}
