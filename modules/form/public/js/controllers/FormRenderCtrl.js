angular.module('formModule').controller('FormRenderCtrl', ['$scope',
    function ($scope)
{

    $scope.displayInstruction = false;

    $scope.nativeRenderTypesText = ['Dynamic', 'Follow-up', 'Instructions'];
    $scope.nativeRenderTypes = {
        SHOW_IF: 0,
        FOLLOW_UP: 1,
        GOTO_INSTRUCTIONS: 2
    };
    $scope.getNativeRenderType = function () {
        return $scope.nativeRenderType;
    };
    $scope.setNativeRenderType = function (type) {
        if (type == undefined) type = 1;
        $scope.nativeRenderType = type;

        if ($scope.nativeRenderType === $scope.nativeRenderTypes.FOLLOW_UP && (!$scope.followForm || $scope.elt.unsaved)) {
            $scope.followForm = angular.copy($scope.elt);
            transformFormToInline($scope.followForm);
            $scope.formElement = $scope.followForm;
        }
        if ($scope.nativeRenderType === $scope.nativeRenderTypes.SHOW_IF)
            $scope.formElement = $scope.elt;
    };

    $scope.selection = {};
    var setSelectedProfile = function () {
        if ($scope.elt && $scope.elt.displayProfiles && $scope.elt.displayProfiles.length > 0) {
            $scope.selection.selectedProfile = $scope.elt.displayProfiles[0];
            $scope.setNativeRenderType($scope.selection.selectedProfile.displayType);
        } else {
            $scope.setNativeRenderType($scope.nativeRenderTypes.FOLLOW_UP);
        }
    };

    $scope.$on('eltReloaded', function () {
        setSelectedProfile();
    });
    setSelectedProfile();

    var removeAnswers = function (formElt) {
        if (formElt.question) delete formElt.question.answer;
        formElt.formElements.forEach(function (fe) {
            removeAnswers(fe);
        });
    };

    $scope.addSection = function (section, formElements, index) {
        var newElt = JSON.parse(JSON.stringify(section));
        newElt.isCopy = true;
        removeAnswers(newElt);
        formElements.splice(index + 1, 0, newElt);
    };

    $scope.removeSection = function (index) {
        $scope.elt.formElements.splice(index, 1);
    };

    $scope.canRepeat = function (formElt) {
        return formElt.cardinality === {min:0,max:-1} || formElt.cardinality === {min:1,max:-1};
    };

    var findQuestionByTinyId = function (tinyId) {
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
        $scope.elt.formElements.forEach(doFormElement);
        return result;
    };

    $scope.score = function (question) {
        if (!question.question.isScore) return;
        var result = 0;
        question.question.cde.derivationRules.forEach(function (derRule) {
            if (derRule.ruleType === 'score' && derRule.formula === "sumAll") {
                derRule.inputs.forEach(function (cdeTinyId) {
                    var q = findQuestionByTinyId(cdeTinyId);
                    if (isNaN(result)) return;
                    if (q) {
                        var answer = q.question.answer;
                        if (answer === undefined) return result = "Incomplete answers";
                        if (isNaN(answer)) return result = "Unable to score";
                        else result = result + parseFloat(answer);
                    }
                });
            }
        });
        return result;
    };

    var stripFieldsOut = function (elt) {
        delete elt.cardinality;
        delete elt.$$hashKey;
        if (elt.elementType === 'section') {
            delete elt.question;
        }
        if (elt.question) {
            delete elt.question.answers;
            delete elt.question.uoms;
            delete elt.question.required;
            delete elt.question.datatype;
            if (elt.question.cde) {
                delete elt.question.cde.permissibleValues;
            }
        }
        if (elt.formElements) {
            for (var i = 0; i < elt.formElements.length; i++) {
                stripFieldsOut(elt.formElements[i]);
            }
        }
    };

    $scope.evaluateSkipLogic = function (condition, formElements, question) {
        if (!condition) return true;
        var rule = condition.trim();
        if (rule.indexOf("AND") > -1) {
            return $scope.evaluateSkipLogic(/.+AND/.exec(rule)[0].slice(0, -4), formElements, question) &&
                $scope.evaluateSkipLogic(/AND.+/.exec(rule)[0].substr(4), formElements, question);
        }
        if (rule.indexOf("OR") > -1) {
            return ($scope.evaluateSkipLogic(/.+OR/.exec(rule)[0].slice(0, -3), formElements, question) ||
            $scope.evaluateSkipLogic(/OR.+/.exec(rule)[0].substr(3), formElements, question))
        }
        var ruleArr = rule.split(/[>|<|=|<=|>=]/);
        var questionLabel = ruleArr[0].replace(/"/g, "").trim();
        var operatorArr = /=|<|>|>=|<=/.exec(rule);
        if (!operatorArr) {
            $scope.skipLogicError = "SkipLogic is incorrect. " + rule;
            return true;
        }
        var operator = operatorArr[0];
        var expectedAnswer = ruleArr[1].replace(/"/g, "").trim();
        var realAnswerArr = formElements.filter(function (element) {
            if (element.elementType != 'question') return false;
            else return element.label == questionLabel;
        });
        var realAnswerObj = realAnswerArr[0];
        var realAnswer = realAnswerObj ? realAnswerObj.question.answer : undefined;
        if (expectedAnswer === "")
        {
            if (realAnswerObj.question.datatype === 'Number') {
                if (realAnswer === null || Number.isNaN(realAnswer)) return true;
            } else {
                if (!realAnswer || ("" + realAnswer).trim().length === 0) return true;
            }
        }
        else if (realAnswer) {
            if (realAnswerObj.question.datatype === 'Date') {
                question.question.dateOptions = {};
                if (operator === '=') {
                    return new Date(realAnswer).getTime() === new Date(expectedAnswer).getTime();
                }
                if (operator === '<') {
                    return new Date(realAnswer) < new Date(expectedAnswer);
                }
                if (operator === '>') {
                    return new Date(realAnswer) > new Date(expectedAnswer);
                }
                if (operator === '<=') {
                    return new Date(realAnswer) <= new Date(expectedAnswer);
                }
                if (operator === '>=') {
                    return new Date(realAnswer) >= new Date(expectedAnswer);
                }
            } else if (realAnswerObj.question.datatype === 'Number') {
                if (operator === '=') return realAnswer === parseInt(expectedAnswer);
                if (operator === '<') return realAnswer < parseInt(expectedAnswer);
                if (operator === '>') return realAnswer > parseInt(expectedAnswer);
                if (operator === '<=') return realAnswer <= parseInt(expectedAnswer);
                if (operator === '>=') return realAnswer >= parseInt(expectedAnswer);
            } else if (realAnswerObj.question.datatype === 'Text') {
                if (operator === '=') return realAnswer === expectedAnswer;
                else return false;
            } else if (realAnswerObj.question.datatype === 'Value List' ) {
                if (operator === '=') {
                    if (Array.isArray(realAnswer))
                        return realAnswer.indexOf(expectedAnswer) > -1;
                    else
                        return realAnswer === expectedAnswer;
                }
                else return false;
            } else {
                return realAnswer === expectedAnswer;
            }
        } else return false;
    };

    $scope.evaluateSkipLogicAndClear = function (rule, formElements, question) {
        var skipLogicResult = $scope.evaluateSkipLogic(rule, formElements, question);

        if (!skipLogicResult) question.question.answer = undefined;
        return skipLogicResult;
    };

    $scope.canBeDisplayedAsMatrix = function (section) {
        var result = true;
        var answerHash;
        section && section.formElements && section.formElements.forEach(function (formElem) {
            if (formElem.elementType !== 'question') {
                return result = false;
            } else {
                if (formElem.question.datatype !== "Value List") {
                    return result = false;
                }
                if (formElem.question.answers.length === 0 || !formElem.question.answers[0].valueMeaningName)
                    return result = false;
                if (!answerHash) {
                    answerHash = angular.toJson(formElem.question.answers.map(function (a) {
                        return a.valueMeaningName
                    }));
                }
                if (answerHash !== angular.toJson(formElem.question.answers.map(function (a) {
                        return a.valueMeaningName
                    }))) {
                    return result = false;
                }
            }
        });
        return result;
    };

    $scope.isSectionDisplayed = function (section) {
        return section.label || section.formElements.some(function (elem) {return elem.elementType === "question";});
    };
    $scope.hasLabel = function (question) {
        return question.label && !question.hideLabel;
    };
    $scope.isOneLiner = function (question, numSubQuestions) {
        return numSubQuestions &&
            /*numSubQuestions === 1 &&*/
            !$scope.hasLabel(question) &&
            question.question.datatype !== 'Value List';
    };

    function transformFormToInline(form) {
        var prevQ = "";
        var feSize = form.formElements.length;
        for (var i = 0; i < feSize; i++ ) {
            var fe = form.formElements[i];
            if (fe.elementType === 'section' || fe.elementType === 'form') {
                transformFormToInline(fe);
                if (fe.skipLogic) delete fe.skipLogic;
                continue;
            }
            var qs = getShowIfQ(fe, prevQ);
            if (qs.length > 0) {
                parentQ = qs[0][0];
                qs.forEach(function (match) {
                    var answer = parentQ.question.answers.filter(function(a){ return a.permissibleValue === match[3]; });
                    if (answer.length) answer = answer[0];
                    if (answer) {
                        if (!answer.subQuestions) answer.subQuestions = [];
                        answer.subQuestions.push(fe);
                    }
                });
                form.formElements.splice(i,1);
                feSize--;
                i--;
                prevQ.push(fe);
            } else {
                prevQ = [fe];
            }
            // after transform processing of questions
            if (fe.question.uoms && fe.question.uoms.length === 1)
                fe.question.answerUom = fe.question.uoms[0];
            if (fe.skipLogic) delete fe.skipLogic;
        }
    }

    function getShowIfQ(q, prevQ) {
        if (q.skipLogic && q.skipLogic.condition) {
            var strPieces = q.skipLogic.condition.split('"');
            var lStrPieces = strPieces.length;
            var accumulate = [];
            for (var i=0; i < lStrPieces; i++) {
                var matchQ = prevQ.filter(function(q) { return q.label === strPieces[i]; });
                if(matchQ.length) {
                    accumulate.push([matchQ[0], strPieces[i], strPieces[i+1], strPieces[i+2]]);
                }
            }
            return accumulate;
        }
        return [];
    }

}]);


