(function () {
    'use strict';
    angular.module('nativeSection', [])
        .directive("nativeSection", function () {
            return {
                restrict: "EA",
                scope: {
                    formElements: '<?',
                    formElement: '<',
                    numSubQuestions: '<?',
                    profile: '<',
                    elt: '<',
                    error: '='
                },
                templateUrl: '/form/public/html/native-section.html',
                controller: ["$scope", "nativeFormService", function ($scope, nativeFormService) {
                    $scope.nativeFormService = nativeFormService;
                    $scope.isSectionDisplayed = function (section) {
                        return section.label ||
                            section.formElements.some(function (elem) {
                                return elem.elementType === "question";
                            });
                    };
                    $scope.canBeDisplayedAsMatrix = function (section) {
                        if (!section) return true;
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

                    function removeAnswers(formElt) {
                        if (formElt.question) delete formElt.question.answer;
                        formElt.formElements.forEach(function (fe) {
                            removeAnswers(fe);
                        });
                    }
                }]
            };
        });
}());
