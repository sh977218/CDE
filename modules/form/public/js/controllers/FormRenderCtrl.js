angular.module('formModule').controller('FormRenderCtrl', ['$scope', '$location', '$sce',
    function ($scope, $location, $sce)
{

    $scope.displayInstruction = false;

    $scope.formUrl = $location.absUrl();

    $scope.classColumns = function (pvIndex, index) {
        var result = '';

        if ( pvIndex !== -1 && $scope.selection.selectedProfile && $scope.selection.selectedProfile.numberOfColumns) {
            switch ($scope.selection.selectedProfile.numberOfColumns) {
                case 2:
                    result = 'col-sm-6';
                    break;
                case 3:
                    result = 'col-sm-4';
                    break;
                case 4:
                    result = 'col-sm-3';
                    break;
                case 5:
                    result = 'col-sm-2-4';
                    break;
                case 6:
                    result = 'col-sm-2';
                    break;
                default:
            }
        }

        if ($scope.isFirstInRow(pvIndex != undefined ? pvIndex : index))
            result += ' clear';
        return result;
    };

    $scope.SHOW_IF = 'Dynamic';
    $scope.FOLLOW_UP = 'Follow-up';
    $scope.setNativeRenderType = function (type) {
        if (type == undefined) type = $scope.FOLLOW_UP;
        $scope.nativeRenderType = type;

        if ($scope.nativeRenderType === $scope.FOLLOW_UP) {
            if (!$scope.followForm || $scope.elt.unsaved) {
                $scope.formElement = undefined;
                $scope.followForm = angular.copy($scope.elt);
                transformFormToInline($scope.followForm);
                preprocessValueLists($scope.followForm.formElements);
            }
            $scope.formElement = $scope.followForm;
        }
        if ($scope.nativeRenderType === $scope.SHOW_IF)
            $scope.formElement = $scope.elt;
    };

    $scope.getElt = function () {
        switch ($scope.nativeRenderType) {
            case $scope.SHOW_IF:
                return $scope.elt;
            case $scope.FOLLOW_UP:
                return $scope.followForm;
        }
    };

    $scope.getEndpointUrl = function () {
        return $sce.trustAsResourceUrl(window.endpointUrl);
    };

    $scope.selection = {};
    var setSelectedProfile = function () {
        if ($scope.elt && $scope.elt.displayProfiles && $scope.elt.displayProfiles.length > 0 &&
            $scope.elt.displayProfiles.indexOf($scope.selection.selectedProfile) === -1)
            $scope.selection.selectedProfile = $scope.elt.displayProfiles[0];
        if (!$scope.selection.selectedProfile)
            $scope.selection.selectedProfile = {
                name: "Default Config",
                displayInstructions: true,
                displayNumbering: true,
                sectionsAsMatrix: true,
                displayType: 'Follow-up',
                numberOfColumns: 4
            };
        $scope.setNativeRenderType($scope.selection.selectedProfile.displayType);
    };

    $scope.createSubmitMapping = function () {
        if (window.endpointUrl) {
            $scope.mapping = JSON.stringify({sections: flattenForm($scope.elt.formElements)});
        }
    };

    $scope.$on('eltReloaded', function () {
        $scope.createSubmitMapping();
        delete $scope.followForm;
        setSelectedProfile();
    });
    $scope.$on('tabGeneral', function () {
        $scope.createSubmitMapping();
        setSelectedProfile();
    });
    $scope.createSubmitMapping();
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
        return formElt.cardinality === {min: 0, max: -1} || formElt.cardinality === {min: 1, max: -1};
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
        $scope.getElt().formElements.forEach(doFormElement);
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
        var ruleArr = rule.split(/>=|<=|=|>|</);
        var questionLabel = ruleArr[0].replace(/"/g, "").trim();
        var operatorArr = />=|<=|=|>|</.exec(rule);
        if (!operatorArr) {
            $scope.skipLogicError = "SkipLogic is incorrect. " + rule;
            return true;
        }
        var operator = operatorArr[0];
        var expectedAnswer = ruleArr[1].replace(/"/g, "").trim();
        var realAnswerArr = getQuestions(formElements, questionLabel);
        var realAnswerObj = realAnswerArr[0];
        var realAnswer = realAnswerObj ? realAnswerObj.question.answer : undefined;
        if (expectedAnswer === "") {
            if (realAnswerObj.question.datatype === 'Number') {
                if (realAnswer === null || Number.isNaN(realAnswer)) return true;
            } else {
                if (!realAnswer || ("" + realAnswer).trim().length === 0) return true;
            }
        }
        else if (realAnswer) {
            if (realAnswerObj.question.datatype === 'Date') {
                question.question.dateOptions = {};
                if (operator === '=') return new Date(realAnswer).getTime() === new Date(expectedAnswer).getTime();
                if (operator === '<') return new Date(realAnswer) < new Date(expectedAnswer);
                if (operator === '>') return new Date(realAnswer) > new Date(expectedAnswer);
                if (operator === '<=') return new Date(realAnswer) <= new Date(expectedAnswer);
                if (operator === '>=') return new Date(realAnswer) >= new Date(expectedAnswer);
            } else if (realAnswerObj.question.datatype === 'Number') {
                if (operator === '=') return realAnswer === parseInt(expectedAnswer);
                if (operator === '<') return realAnswer < parseInt(expectedAnswer);
                if (operator === '>') return realAnswer > parseInt(expectedAnswer);
                if (operator === '<=') return realAnswer <= parseInt(expectedAnswer);
                if (operator === '>=') return realAnswer >= parseInt(expectedAnswer);
            } else if (realAnswerObj.question.datatype === 'Text') {
                if (operator === '=') return realAnswer === expectedAnswer;
                else return false;
            } else if (realAnswerObj.question.datatype === 'Value List') {
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
        if (section && section.formElements && section.formElements.length === 0)
            return false;
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
        if (section.forbidMatrix)
            return false;
        return result;
    };

    $scope.isSectionDisplayed = function (section) {
        return section.label ||
            section.formElements.some(function (elem) {
                return elem.elementType === "question";
            });
    };
    $scope.hasLabel = function (question) {
        return question.label && !question.hideLabel;
    };
    $scope.classAnswerLabel = function (question, numSubQuestions) {
        if(numSubQuestions &&
            /*numSubQuestions === 1 &&*/
            !$scope.hasLabel(question) &&
            question.question.datatype !== 'Value List')
            return 'native-question-oneline-l';
        else
            return '';
    };
    $scope.isFirstInRow = function (index) {
        if ($scope.selection.selectedProfile && $scope.selection.selectedProfile.numberOfColumns > 0)
            return index % $scope.selection.selectedProfile.numberOfColumns == 0;
        else
            return index % 4 == 0;
    };
    $scope.classTextBox = function (flag) {
        if (flag)
            return 'input-group';
        else
            return '';
    };

    function getQuestions(fe, qLabel) {
        var result = [];
        fe.forEach(function (element) {
            if (element.elementType != 'question')
                result = result.concat(getQuestions(element.formElements, qLabel));
            else
                if (element.label == qLabel)
                    result = result.concat(element);
        });
        return result;
    }

    function transformFormToInline(form) {
        var prevQ = "";
        var transformed = false;
        var feSize = form.formElements.length;
        for (var i = 0; i < feSize; i++) {
            var fe = form.formElements[i];
            var qs = getShowIfQ(fe, prevQ);
            if (qs.length > 0) {
                var substituted = false;
                parentQ = qs[0][0];
                qs.forEach(function (match) {
                    var answer;
                    if (parentQ.question.datatype === 'Value List') {
                        if (match[3] === '') {
                            parentQ.question.answers.push({
                                permissibleValue: createRelativeText([match[3]], match[2], true),
                                nonValuelist: true,
                                subQuestions: [fe]
                            });
                            substituted = true;
                        } else {
                            answer = parentQ.question.answers.filter(function (a) {
                                return a.permissibleValue === match[3];
                            });
                            if (answer.length) answer = answer[0];
                            if (answer) {
                                if (!answer.subQuestions) answer.subQuestions = [];
                                answer.subQuestions.push(fe);
                                substituted = true;
                            }
                        }
                    } else {
                        if (!parentQ.question.answers) parentQ.question.answers = [];
                        var existingLogic = parentQ.question.answers.filter(function(el) {
                            return el.nonValuelist && el.subQuestions.length === 1 && el.subQuestions[0] === fe;
                        });
                        if (existingLogic.length > 0) {
                            var existingSubQ = existingLogic[0];
                            existingSubQ.permissibleValue = existingSubQ.permissibleValue + ' or ' +
                                createRelativeText([match[3]], match[2], false);
                        } else {
                            parentQ.question.answers.push({
                                permissibleValue: createRelativeText([match[3]], match[2], false),
                                nonValuelist: true,
                                subQuestions: [fe]
                            });
                        }
                        substituted = true;
                    }
                });
                if (substituted) {
                    form.formElements.splice(i, 1);
                    feSize--;
                    i--;
                    transformed = true;
                }
                prevQ.push(fe);
            } else {
                prevQ = [fe];
            }
            if (fe.elementType === 'section' || fe.elementType === 'form') {
                if (transformFormToInline(fe))
                    fe.forbidMatrix = true;
                if (fe.skipLogic) delete fe.skipLogic;
                continue;
            }
            // after transform processing of questions
            if (fe.question.uoms && fe.question.uoms.length === 1)
                fe.question.answerUom = fe.question.uoms[0];
            if (fe.skipLogic) delete fe.skipLogic;
        }
        return transformed;
    }

    function getShowIfQ(q, prevQ) {
        if (q.skipLogic && q.skipLogic.condition) {
            var strPieces = q.skipLogic.condition.split('"');
            if (strPieces[0] === '') strPieces.shift();
            if (strPieces[strPieces.length - 1] === '') strPieces.pop();
            var accumulate = [];
            strPieces.forEach(function(e,i,strPieces) {
                var matchQ = prevQ.filter(function (q) {
                    return q.label === strPieces[i];
                });
                if (matchQ.length) {
                    var operator = strPieces[i + 1].trim();
                    var compValue = strPieces[i + 2];
                    var operatorWithNumber = operator.split(' ');
                    if (operatorWithNumber.length > 1) {
                        operator = operatorWithNumber[0];
                        compValue = operatorWithNumber[1];
                    }
                    accumulate.push([matchQ[0], strPieces[i], operator, compValue]);
                }
            });
            return accumulate;
        }
        return [];
    }

    function createRelativeText(v, oper, isValuelist) {
        var values = angular.copy(v);
        values.forEach(function (e, i, a) {
           if (e === '') {
               if (isValuelist)
                   a[i] = 'none';
               else
                   a[i] = 'empty';
           }
        });
        switch (oper) {
            case '=':
                return values.join(' or ');
            case '>':
                return 'more than ' + min(values);
            case '<':
                return 'less than ' + max(values);
            case '>=':
                return min(values) + ' or more';
            case '<=':
                return max(values) + ' or less';
        }
    }

    function max(values) {
        return values.length > 0 && values[0].indexOf('/') > -1 ? values[0] : Math.max.apply(null, values);
    }

    function min(values) {
        return values.length > 0 && values[0].indexOf('/') > -1 ? values[0] : Math.max.apply(null, values);
    }

    function preprocessValueLists(formElements) {
        formElements.forEach(function (fe) {
            if (fe.elementType === 'section' || fe.elementType === 'form') {
                preprocessValueLists(fe.formElements);
                return;
            }
            if (fe.question && fe.question.answers) {
                var index = -1;
                fe.question.answers.forEach(function (v,i,a) {
                    if (hasOwnRow(v) || index === -1 && (i+1 < a.length && hasOwnRow(a[i+1]) || i+1 === a.length))
                        v.index = index = -1;
                    else
                        v.index = ++index;
                    if (v.subQuestions)
                        preprocessValueLists(v.subQuestions)
                });
            }
        });
    }

    function hasOwnRow(e) {
        return !!e.subQuestions;
    }

    function flattenForm(formElements) {
        var last_id = 0;
        var result = [];
        var questions = [];
        flattenFormSection(formElements, []);
        return result;

        function createId() {
            return "q" + ++last_id;
        }

        function flattenFormSection(formElements, section) {
            formElements.forEach(function (fe) {
                flattenFormFe(fe, section.concat(fe.label));
            });
            flattenFormPushQuestions(section);
        }

        function flattenFormQuestion(fe, section) {
            fe.questionId = createId();
            q = {'question': fe.label, 'name': fe.questionId, 'ids': fe.question.cde.ids, 'tinyId': fe.question.cde.tinyId};
            if (fe.question.answerUom) q.answerUom = fe.question.answerUom;
            questions.push(q);
            fe.question.answers && fe.question.answers.forEach(function (a) {
                a.subQuestions && a.subQuestions.forEach(function (sq) {
                    flattenFormFe(sq, section);
                });
            });
        }

        function flattenFormFe(fe, section) {
            if (fe.elementType === 'question') {
                flattenFormQuestion(fe, section);
            }
            if (fe.elementType === 'section' || fe.elementType === 'form') {
                flattenFormPushQuestions(section);
                flattenFormSection(fe.formElements, section);
            }
        }

        function flattenFormPushQuestions(section) {
            if (questions.length) {
                result.push({'section': section[section.length - 1], 'questions': questions});
                questions = [];
            }
        }
    }

}]);


