angular.module('formModule').controller('FormViewCtrl', ['$scope', '$routeParams', '$http', 'AlertService',
    function ($scope, $routeParams, $http, Alert) {
        $scope.missingCdes = [];
        $scope.inScoreCdes = [];

        var tinyId = $routeParams.tinyId;
        var formId = $routeParams.formId;
        var url = "/form/" + tinyId;
        if (formId) url = "/formById/" + formId;
        $http.get(url).then(function (response) {
            if (response.status === 200) {
                $scope.elt = response.data;
                $scope.eltLoaded = true;
            } else {
                Alert.addAlert("danger", "Sorry, we are unable to retrieve this form.");
                $scope.eltLoaded = true;
            }
        }, function () {
            Alert.addAlert("danger", "Sorry, we are unable to retrieve this form.");
            $scope.eltLoaded = true;
        });

        $scope.$on('$locationChangeStart', function (event) {
            if ($scope.elt && $scope.elt.unsaved) {
                var txt = "You have unsaved changes, are you sure you want to leave this page? ";
                if (window.debugEnabled) {
                    txt = txt + window.location.pathname;
                }
                var answer = confirm(txt);
                if (!answer) {
                    event.preventDefault();
                }
            }
        });

        $scope.reloadForm = function () {
            $http.get("/form/" + $scope.elt.tinyId).then(function (response) {
                if (response.status === 200) {
                    $scope.elt = response.data;
                    $scope.areDerivationRulesSatisfied();
                    $scope.validateForm();
                    Alert.addAlert("success", "Changes discarded.");
                } else Alert.addAlert("danger", "Sorry, we are unable to retrieve this form." + response.error);
            });
        };

        $scope.stageForm = function () {
            $http.put("/form/" + $scope.elt.tinyId, $scope.elt).then(function (response) {
                if (response.status === 200) {
                    $scope.elt = response.data;
                    Alert.addAlert("success", "Form saved.");
                } else Alert.addAlert("danger", "Sorry, we are unable to retrieve this form." + response.error);
            });
        };


        $scope.areDerivationRulesSatisfied = function () {
            $scope.missingCdes = [];
            $scope.inScoreCdes = [];
            var allCdes = {};
            var allQuestions = [];
            var doFormElement = function (formElt) {
                if (formElt.elementType === 'question') {
                    allCdes[formElt.question.cde.tinyId] = formElt.question.cde;
                    allQuestions.push(formElt);
                } else if (formElt.elementType === 'section') {
                    formElt.formElements.forEach(doFormElement);
                }
            };
            $scope.elt.formElements.forEach(doFormElement);
            allQuestions.forEach(function (quest) {
                if (quest.question.cde.derivationRules)
                    quest.question.cde.derivationRules.forEach(function (derRule) {
                        delete quest.incompleteRule;
                        if (derRule.ruleType === 'score') {
                            quest.question.isScore = true;
                            quest.question.scoreFormula = derRule.formula;
                            $scope.inScoreCdes = derRule.inputs;
                        }
                        derRule.inputs.forEach(function (input) {
                            if (!allCdes[input]) {
                                $scope.missingCdes.push({tinyId: input});
                                quest.incompleteRule = true;
                            }
                        });
                    });
            });
        };

        $scope.validateForm = function () {
            $scope.elt.isFormValid = true;
            var loopFormElements = function (form) {
                if (form.formElements) {
                    form.formElements.forEach(function (fe) {
                        if (fe.skipLogic && fe.skipLogic.error) {
                            $scope.isFormValid = false;
                            return;
                        }
                        loopFormElements(fe);
                    });
                }
            };
            loopFormElements($scope.elt);
        };

    }]);