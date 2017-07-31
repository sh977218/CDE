angular.module('formModule').controller('FormViewCtrl', ['$scope', '$http', 'AlertService',
    function ($scope, $http, Alert) {
        $scope.missingCdes = [];
        $scope.inScoreCdes = [];

        // remove it once has angular2 route
        function getParameterByName(name, url = null) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        var tinyId = getParameterByName("tinyId");
        var cdeId = getParameterByName("cdeId");
        var url;
        if (tinyId) url = "/form/" + tinyId;
        if (cdeId) url = "/formById/" + cdeId;

        $http.get(url).then(function (response) {
            if (response.status === 200) {
                $scope.elt = response.data;
                $scope.areDerivationRulesSatisfied();
                $scope.validateForm();
                $scope.eltLoaded = true;
            } else Alert.addAlert("danger", "Sorry, we are unable to retrieve this form.");
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
            let allCdes = {};
            let allQuestions = [];
            let doFormElement = function (formElt) {
                if (formElt.elementType === 'question') {
                    allCdes[formElt.question.cde.tinyId] = formElt.question.cde;
                    allQuestions.push(formElt);
                } else if (formElt.elementType === 'section') {
                    formElt.formElements.forEach(doFormElement);
                }
            };
            this.elt.formElements.forEach(doFormElement);
            allQuestions.forEach(quest => {
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
                            this.isFormValid = false;
                            return;
                        }
                        loopFormElements(fe);
                    });
                }
            };
            loopFormElements($scope.elt);
        };

    }]);