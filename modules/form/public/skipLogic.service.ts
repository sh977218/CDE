import { Injectable } from "@angular/core";
import { FormService } from "./form.service";

@Injectable()
export class SkipLogicService {
    preSkipLogicSelect = "";

    constructor(private formService: FormService) {}

    evaluateSkipLogic(condition, formElements, question, elt, errors = []) {
        if (!condition) return true;
        let rule = condition.trim();
        if (rule.indexOf("AND") > -1) {
            return this.evaluateSkipLogic(/.+AND/.exec(rule)[0].slice(0, -4), formElements, question, elt, errors) &&
                this.evaluateSkipLogic(/AND.+/.exec(rule)[0].substr(4), formElements, question, elt, errors);
        }
        if (rule.indexOf("OR") > -1) {
            return (this.evaluateSkipLogic(/.+OR/.exec(rule)[0].slice(0, -3), formElements, question, elt, errors) ||
            this.evaluateSkipLogic(/OR.+/.exec(rule)[0].substr(3), formElements, question, elt, errors));
        }
        let ruleArr = rule.split(/>=|<=|=|>|<|!=/);
        let questionLabel = ruleArr[0].replace(/"/g, "").trim();
        let operatorArr = />=|<=|=|>|<|!=/.exec(rule);
        if (!operatorArr) {
            errors.push("SkipLogic is incorrect. " + rule);
            return true;
        }
        let operator = operatorArr[0];
        let expectedAnswer = ruleArr[1].replace(/"/g, "").trim();
        let realAnswerArr = this.formService.getQuestions(formElements, questionLabel);
        let realAnswerObj = realAnswerArr[0];
        let realAnswer = realAnswerObj ? (realAnswerObj.question.isScore ?
            this.formService.score(realAnswerObj, elt) : realAnswerObj.question.answer) : undefined;
        if (realAnswer === undefined || realAnswer === null ||
            (typeof realAnswer === "number" && isNaN(realAnswer))) realAnswer = "";
        if (expectedAnswer === "" && operator === "=") {
            if (realAnswerObj.question.datatype === "Number") {
                if (realAnswer === "" || isNaN(realAnswer)) return true;
            } else {
                if (realAnswer === "" || ("" + realAnswer).trim().length === 0) return true;
            }
        }
        else if (realAnswer || realAnswer === "") {
            if (realAnswerObj.question.datatype === "Date") {
                // format American DD/MM/YYYY to HTML5 standard YYYY-MM-DD
                if (realAnswer)
                    realAnswer = realAnswer.month + "/" + realAnswer.day + "/" + realAnswer.year;
                question.question.dateOptions = {};
                if (operator === "=") return new Date(realAnswer).getTime() === new Date(expectedAnswer).getTime();
                if (operator === "!=") return new Date(realAnswer).getTime() !== new Date(expectedAnswer).getTime();
                if (operator === "<") return new Date(realAnswer) < new Date(expectedAnswer);
                if (operator === ">") return new Date(realAnswer) > new Date(expectedAnswer);
                if (operator === "<=") return new Date(realAnswer) <= new Date(expectedAnswer);
                if (operator === ">=") return new Date(realAnswer) >= new Date(expectedAnswer);
            } else if (realAnswerObj.question.datatype === "Number") {
                if (operator === "=") return realAnswer === parseInt(expectedAnswer);
                if (operator === "!=") return realAnswer !== parseInt(expectedAnswer);
                if (operator === "<") return realAnswer < parseInt(expectedAnswer);
                if (operator === ">") return realAnswer > parseInt(expectedAnswer);
                if (operator === "<=") return realAnswer <= parseInt(expectedAnswer);
                if (operator === ">=") return realAnswer >= parseInt(expectedAnswer);
            } else if (realAnswerObj.question.datatype === "Text") {
                if (operator === "=") return realAnswer === expectedAnswer;
                if (operator === "!=") return realAnswer !== expectedAnswer;
                else return false;
            } else if (realAnswerObj.question.datatype === "Value List") {
                if (operator === "=") {
                    if (Array.isArray(realAnswer))
                        return realAnswer.indexOf(expectedAnswer) > -1;
                    else
                        return realAnswer === expectedAnswer;
                }
                if (operator === "!=") {
                    if (Array.isArray(realAnswer))
                        return realAnswer.length !== 1 || realAnswer[0] !== expectedAnswer;
                    else
                        return realAnswer !== expectedAnswer;
                }
                else
                    return false;
            } else {
                if (operator === "=") return realAnswer === expectedAnswer;
                if (operator === "!=") return realAnswer !== expectedAnswer;
                else return false;
            }
        } else
            return false;
    }

    evaluateSkipLogicAndClear(rule, formElements, question, elt, errors = []) {
        let skipLogicResult = this.evaluateSkipLogic(rule, formElements, question, elt, errors);

        if (!skipLogicResult) question.question.answer = undefined;
        return skipLogicResult;
    }

    getAnswer(previousLevel, questionName) {
        let searchQuestion = questionName.substring(1, questionName.length - 1);
        let questions = previousLevel.filter(function (q) {
            let label = q.label;
            if (!label || label.length === 0) label = q.question.cde.name;
            if (label && questionName) return SkipLogicService.questionSanitizer(label) === searchQuestion;
        });
        if (questions.length <= 0) return [];
        let question = questions[0];
        if (question.question.datatype === 'Value List') {
            let answers = question.question.answers;
            return answers.map(function (a) {
                return '"' + SkipLogicService.questionSanitizer(a.permissibleValue) + '"';
            });
        } else if (question.question.datatype === 'Number') {
            return ['"{{' + question.question.datatype + '}}"'];
        } else if (question.question.datatype === 'Date') {
            return ['"{{MM/DD/YYYY}}"'];
        }
    }

    getCurrentOptions(currentContent, previousQuestions, thisQuestion, index) {
        if (!currentContent) currentContent = '';
        if (!thisQuestion.skipLogic) thisQuestion.skipLogic = {condition: ''};

        let tokens = this.tokenSplitter(currentContent);
        this.preSkipLogicSelect = currentContent.substr(0, currentContent.length - tokens.unmatched.length);

        let options = [];
        if (tokens.length % 4 === 0) {
            options = previousQuestions.filter(function (q, i) {
                // Will assemble a list of questions
                if (i >= index) return false; // Exclude myself
                else if (q.elementType !== "question") return false; // This element is not a question, ignore
                else if (q.question.datatype === 'Value List' && (!q.question.answers || q.question.answers.length === 0)) return false; // This question has no permissible answers, ignore
                else if (q.question.datatype === 'Date' || q.question.datatype === 'Number') return true;
                else return true;
            }).map(function (q) {
                let label = q.label;
                if (!label || label.length === 0) label = q.question.cde.name;
                return '"' + SkipLogicService.questionSanitizer(label) + '" ';
            });
        } else if (tokens.length % 4 === 1) {
            options = ["=", "<", ">", ">=", "<=", "!="];
        } else if (tokens.length % 4 === 2) {
            options = this.getAnswer(previousQuestions, tokens[tokens.length - 2]);
        } else if (tokens.length % 4 === 3) {
            options = ["AND", "OR"];
        }

        let optionsFiltered = options.filter(o => o.indexOf(tokens.unmatched) > -1);
        if (optionsFiltered.length > 0)
            options = optionsFiltered;

        return options;
    }

    tokenSplitter(str) {
        let tokens: any = [];
        if (!str) {
            tokens.unmatched = "";
            return tokens;
        }
        str = str.trim();

        let res = str.match(/^"[^"]+"/);
        if (!res) {
            tokens.unmatched = str;
            return tokens;
        }
        str = str.substring(res[0].length).trim();
        tokens.push(res[0]);

        res = str.match(/^(>=|<=|=|>|<|!=)/);
        if (!res) {
            tokens.unmatched = str;
            return tokens;
        }
        tokens.push(res[0]);
        str = str.substring(res[0].length).trim();

        res = str.match(/^"([^"]*)"/);
        if (!res) {
            tokens.unmatched = str;
            return tokens;
        }
        tokens.push(res[0]);
        str = str.substr(res[0].length).trim();

        res = str.match(/^((\bAND\b)|(\bOR\b))/);
        if (!res) {
            tokens.unmatched = str;
            return tokens;
        }
        tokens.push(res[0]);
        str = str.substring(res[0].length).trim();

        tokens.unmatched = str;

        if (str.length > 0) {
            let innerTokens = this.tokenSplitter(str);
            let outerTokens = tokens.concat(innerTokens);
            outerTokens.unmatched = innerTokens.unmatched;
            return outerTokens;
        } else {
            return tokens;
        }
    }

    validateSingleExpression(tokens, previousQuestions) {
        let filteredQuestions = previousQuestions.filter(function (pq) {
            let label = pq.label;
            if (!label || label.length === 0) label = pq.question.cde.name;
            return '"' + SkipLogicService.questionSanitizer(label) + '"' === tokens[0];
        });
        if (filteredQuestions.length !== 1) {
            return '"' + tokens[0] + '" is not a valid question label';
        } else {
            let filteredQuestion = filteredQuestions[0];
            if (filteredQuestion.question.datatype === 'Value List') {
                if (tokens[2].length > 0 && filteredQuestion.question.answers.map(function (a) {
                        return '"' + SkipLogicService.questionSanitizer(a.permissibleValue) + '"';
                    }).indexOf(tokens[2]) < 0) {
                    return '"' + tokens[2] + '" is not a valid answer for "' + filteredQuestion.label + '"';
                }
            } else if (filteredQuestion.question.datatype === 'Number') {
                if (isNaN(tokens[2]))
                    return '"' + tokens[2] + '" is not a valid number for "' + filteredQuestion.label + '". Replace ' + tokens[2] + " with a valid number.";
                else if (filteredQuestion.question.datatypeNumber) {
                    let answerNumber = parseInt(tokens[2]);
                    let max = filteredQuestion.question.datatypeNumber.maxValue;
                    let min = filteredQuestion.question.datatypeNumber.minValue;
                    if (min !== undefined && answerNumber < min)
                        return '"' + tokens[2] + '" is less than a minimal answer for "' + filteredQuestion.label + '"';
                    if (max !== undefined && answerNumber > max)
                        return '"' + tokens[2] + '" is bigger than a maximal answer for "' + filteredQuestion.label + '"';
                }
            } else if (filteredQuestion.question.datatype === 'Date') {
                if (tokens[2].length > 0 && new Date(tokens[2]).toString() === 'Invalid Date')
                    return '"' + tokens[2] + '" is not a valid date for "' + filteredQuestion.label + '".';
            }
        }
    }

    validateSkipLogic(skipLogic, previousQuestions, event) {
        if (event) {
            if (event.item)
                skipLogic.condition = this.preSkipLogicSelect + event.item;
            else
                skipLogic.condition = event;
        }

        let logic = skipLogic.condition.trim();
        let tokens = this.tokenSplitter(logic);
        delete skipLogic.validationError;
        if (tokens.unmatched) {
            skipLogic.validationError = "Unexpected token: " + tokens.unmatched;
            return false;
        }
        if (!logic || logic.length === 0) {
            return true;
        }
        if ((tokens.length - 3) % 4 !== 0) {
            skipLogic.validationError = "Unexpected number of tokens in expression " + tokens.length;
            return false;
        }
        let err = this.validateSingleExpression(tokens.slice(0, 3), previousQuestions);
        if (err) {
            skipLogic.validationError = err;
            return false;
        }
        return true;
    }

    static questionSanitizer(label) {
        return label.replace(/"/g, "'").trim();
    }
}