angular.module('formModule', ['resourcesForm', 'ngRoute', 'ui.scrollpoint', 'formTemplates', 'nativeSection', 'nativeQuestion']).config(
    ["$routeProvider", function($routeProvider)
{
    $routeProvider.
        when('/form/search', {
            controller: 'ListCtrl',
            subCtrl: 'FormListCtrl',
            templateUrl: '/system/public/html/list.html',
            reloadOnSearch: false,
            title: "Find protocol forms",
            keywords: 'form, protocol, protocol form, crf, case report form, repository',
            description: 'Repository of Protocol Forms and Common Data Elements. Search Forms and CDEs.'
        }).
        when('/createForm', {controller: 'CreateFormCtrl', templateUrl: '/form/public/html/createForm.html'}).
        when('/formView', {controller: 'FormViewCtrl', templateUrl: '/form/public/html/formView.html'});
}]);

// Angular 2 upgraded
angular.module('formModule').directive('formAccordionList', function () {
    return {
        scope: {forms: '=', ejsPage: '=', module: '='},
        templateUrl: '/form/public/html/formAccordionList.html'}
});
angular.module('formModule').directive('formSummaryList', ["PinModal", function (PinModal) {
    return {
        scope: {forms: '=', ejsPage: '=', module: '=', includeInAccordion: "="},
        templateUrl: '/form/public/html/formSummaryList.html',
        controller: ["$scope", "PinModal", function ($scope, PinModal) {
            $scope.PinModal = PinModal.new("form");
        }]
    };
}]);

angular.module('formModule').directive("jqSlider", ["$compile", "$timeout", "$parse", function ($compile, $timeout, $parse) {
    return {
        link: function ($scope, element, attrs) {
            $timeout(function () {
                $(function () {
                    var handle = $(element).find(".ui-slider-handle");
                    $(element).slider({
                        value: $parse(attrs.jqSlider)($scope),
                        min: $parse(attrs.jqSliderMin)($scope),
                        max: $parse(attrs.jqSliderMax)($scope),
                        step: $parse(attrs.jqSliderStep)($scope),
                        create: function () {
                            handle.text($(this).slider("value"));
                        },
                        slide: function (event, ui) { // jshint ignore:line
                            handle.text(ui.value);
                            $parse(attrs.jqSlider).assign($scope, ui.value);
                            $scope.$apply($parse(attrs.jqSliderOnslide)($scope));
                        }
                    });
                });
            }, 0, false);
        }
    };
}]);

angular.module('formModule').factory('nativeFormService', [ function() {
    return {
        getQuestions: function (fe, qLabel) {
            var result = [];
            var service = this;
            fe.forEach(function (element) {
                if (element.elementType != 'question')
                    result = result.concat(service.getQuestions(element.formElements, qLabel));
                else {
                    var label = element.label;
                    if (!label || label.length === 0) label = element.question.cde.name;
                    if (label == qLabel)
                        result = result.concat(element);
                }
            });
            return result;
        },
        findQuestionByTinyId: function (tinyId, elt) {
            var result = null;
            var doFormElement = function (formElt) {
                if (formElt.elementType === 'question') {
                    if (formElt.question.cde.tinyId === tinyId) {
                        result = formElt;
                    }
                } else if (formElt.elementType === 'section') {
                    formElt.formElements.forEach(doFormElement);
                }
            };
            elt.formElements.forEach(doFormElement);
            return result;
        },
        score: function (question, elt) {
            if (!question.question.isScore) return;
            var result = 0;
            var service = this;
            question.question.cde.derivationRules.forEach(function (derRule) {
                if (derRule.ruleType === 'score') {
                    if (derRule.formula === "sumAll" || derRule.formula === 'mean' ) {
                        derRule.inputs.forEach(function (cdeTinyId) {
                            var q = service.findQuestionByTinyId(cdeTinyId, elt);
                            if (isNaN(result)) return;
                            if (q) {
                                var answer = q.question.answer;
                                if (answer === undefined) return result = "Incomplete answers";
                                if (isNaN(answer)) return result = "Unable to score";
                                else result = result + parseFloat(answer);
                            }
                        });
                    }
                    if (derRule.formula === 'mean') {
                        if (!isNaN(result)) result = result / derRule.inputs.length;
                    }
                }
            });
            return result;
        },
        evaluateSkipLogic: function (skipLogicError, condition, formElements, question, elt) {
            if (!condition) return true;
            var rule = condition.trim();
            if (rule.indexOf("AND") > -1) {
                return this.evaluateSkipLogic(skipLogicError, /.+AND/.exec(rule)[0].slice(0, -4), formElements, question) &&
                    this.evaluateSkipLogic(skipLogicError, /AND.+/.exec(rule)[0].substr(4), formElements, question);
            }
            if (rule.indexOf("OR") > -1) {
                return (this.evaluateSkipLogic(skipLogicError, /.+OR/.exec(rule)[0].slice(0, -3), formElements, question) ||
                this.evaluateSkipLogic(skipLogicError, /OR.+/.exec(rule)[0].substr(3), formElements, question))
            }
            var ruleArr = rule.split(/>=|<=|=|>|<|!=/);
            var questionLabel = ruleArr[0].replace(/"/g, "").trim();
            var operatorArr = />=|<=|=|>|<|!=/.exec(rule);
            if (!operatorArr) {
                skipLogicError.msg = "SkipLogic is incorrect. " + rule;
                return true;
            }
            var operator = operatorArr[0];
            var expectedAnswer = ruleArr[1].replace(/"/g, "").trim();
            var realAnswerArr = this.getQuestions(formElements, questionLabel);
            var realAnswerObj = realAnswerArr[0];
            var realAnswer = realAnswerObj ? (realAnswerObj.question.isScore ?
                this.score(realAnswerObj, elt) : realAnswerObj.question.answer) : undefined;
            if (realAnswer === undefined || realAnswer === null ||
                (typeof realAnswer === "number" && isNaN(realAnswer))) realAnswer = "";
            if (expectedAnswer === "" && operator === '=') {
                if (realAnswerObj.question.datatype === 'Number') {
                    if (realAnswer === "" || isNaN(realAnswer)) return true;
                } else {
                    if (realAnswer === "" || ("" + realAnswer).trim().length === 0) return true;
                }
            }
            else if (realAnswer || realAnswer === "") {
                if (realAnswerObj.question.datatype === 'Date') {
                    question.question.dateOptions = {};
                    if (operator === '=') return new Date(realAnswer).getTime() === new Date(expectedAnswer).getTime();
                    if (operator === '!=') return new Date(realAnswer).getTime() != new Date(expectedAnswer).getTime();
                    if (operator === '<') return new Date(realAnswer) < new Date(expectedAnswer);
                    if (operator === '>') return new Date(realAnswer) > new Date(expectedAnswer);
                    if (operator === '<=') return new Date(realAnswer) <= new Date(expectedAnswer);
                    if (operator === '>=') return new Date(realAnswer) >= new Date(expectedAnswer);
                } else if (realAnswerObj.question.datatype === 'Number') {
                    if (operator === '=') return realAnswer === parseInt(expectedAnswer);
                    if (operator === '!=') return realAnswer != parseInt(expectedAnswer);
                    if (operator === '<') return realAnswer < parseInt(expectedAnswer);
                    if (operator === '>') return realAnswer > parseInt(expectedAnswer);
                    if (operator === '<=') return realAnswer <= parseInt(expectedAnswer);
                    if (operator === '>=') return realAnswer >= parseInt(expectedAnswer);
                } else if (realAnswerObj.question.datatype === 'Text') {
                    if (operator === '=') return realAnswer === expectedAnswer;
                    if (operator === '!=') return realAnswer != expectedAnswer;
                    else return false;
                } else if (realAnswerObj.question.datatype === 'Value List') {
                    if (operator === '=') {
                        if (Array.isArray(realAnswer))
                            return realAnswer.indexOf(expectedAnswer) > -1;
                        else
                            return realAnswer === expectedAnswer;
                    }
                    if (operator === '!=') {
                        if (Array.isArray(realAnswer))
                            return realAnswer.length != 1 || realAnswer[0] != expectedAnswer ;
                        else
                            return realAnswer != expectedAnswer;
                    }
                    else return false;
                } else {
                    if (operator === '=') return realAnswer === expectedAnswer;
                    if (operator === '!=') return realAnswer != expectedAnswer;
                    else return false;
                }
            } else return false;
        },
        evaluateSkipLogicAndClear: function (skipLogicError, rule, formElements, question, elt) {
            var skipLogicResult = this.evaluateSkipLogic(skipLogicError, rule, formElements, question, elt);

            if (!skipLogicResult) question.question.answer = undefined;
            return skipLogicResult;
        }
    };
}]);
