angular.module('formModule')
    .controller('FormRenderCtrl',
    ['$scope', '$http', '$routeParams', '$window',
        function ($scope, $http, $routeParams, $window)
{

    $scope.displayInstruction = false;

    $scope.selection = {};
    var setSelectedProfile = function () {
        if ($scope.elt && $scope.elt.displayProfiles && $scope.elt.displayProfiles.length > 0) {
            $scope.selection.selectedProfile = $scope.elt.displayProfiles[0];
        }
    };

    var reload = function (id) {
        $http.get('/form/' + id).then(function (result) {
            $scope.elt = result.data;
            delete $scope.elt.attachments;
            delete $scope.elt.classification;
            delete $scope.elt.comments;
            delete $scope.elt.created;
            delete $scope.elt.createdBy;
            delete $scope.elt.history;
            delete $scope.elt.properties;
            delete $scope.elt.registrationState;
            delete $scope.elt.stewardOrg;
            setSelectedProfile();
        });
    };

    if ($routeParams.id) {
        reload($routeParams);
    }
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
        return formElt.cardinality === '*' || formElt.cardinality === '+';
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

    $scope.isIe = function () {
        var browsers = {chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /MSIE/i};
        return browsers['ie'].test($window.navigator.userAgent);
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


    $scope.exportStr = function () {
        if (!$scope.isIe()) {
            var formData = JSON.parse(JSON.stringify($scope.elt));
            if (formData.formElements) {
                for (var i = 0; i < formData.formElements.length; i++) {
                    stripFieldsOut(formData.formElements[i]);
                }
            }
            $scope.encodedStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData));
        } else {
            alert("For security reasons, this feature is not supported in IE. ");
            $scope.encodedStr = '/';
        }
    };

    $scope.evaluateSkipLogic = function (rule, formElements) {
        if (!rule) return true;
        rule = rule.trim();
        if (rule.indexOf("AND") > -1) {
            var firstRule = /.+AND/.exec(rule)[0].slice(0, -4);
            var secondRule = /AND.+/.exec(rule)[0].substr(4, 100);
            var firstResult = $scope.evaluateSkipLogic(firstRule, formElements);
            var secondResult = $scope.evaluateSkipLogic(secondRule, formElements);
            if (firstResult && secondResult)
                return true;
            else return false;
        }
        if (rule.indexOf("OR") > -1) {
            var firstRule = /.+OR/.exec(rule)[0].slice(0, -3);
            var secondRule = /OR.+/.exec(rule)[0].substr(3, 100);
            var firstResult = $scope.evaluateSkipLogic(firstRule, formElements);
            var secondResult = $scope.evaluateSkipLogic(secondRule, formElements);
            if (firstResult || secondResult)
                return true;
            else return false;
        }
        var ruleArr = rule.split(/[>|<|=]/);
        var question = ruleArr[0].replace(/"/g, "").trim();
        var operator = /=|<|>|>=|<=/.exec(rule)[0];
        var expectedAnswer = ruleArr[1].replace(/"/g, "").trim();
        var realAnswerArr = formElements.filter(function (element) {
            if (element.elementType != 'question') return false;
            else if (element.label != question) return false;
            else return true;
        });
        var realAnswerObj = realAnswerArr[0];
        var realAnswer = realAnswerObj.question.answer;
        if (realAnswer) {
            if (operator === '=') {
                if (typeof realAnswer === 'number')
                    return realAnswer === parseInt(expectedAnswer);
                else return realAnswer === expectedAnswer;
            }
            if (operator === '<') return realAnswer < parseInt(expectedAnswer);
            if (operator === '>') return realAnswer > parseInt(expectedAnswer);
        } else return false;
    };

    $scope.canBeDisplayedAsMatrix = function (section) {
        var result = true;
        var answerHash;
        section.formElements.forEach(function (formElem) {
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

}]);


