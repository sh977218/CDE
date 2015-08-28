angular.module('formModule').controller('FormViewCtrl',
    ['$scope', '$routeParams', 'Form', 'isAllowedModel', '$modal', 'BulkClassification', '$http', 'userResource',
        function ($scope, $routeParams, Form, isAllowedModel, $modal, BulkClassification, $http, userResource)
{

    $scope.module = "form";
    $scope.baseLink = 'formView?tinyId=';
    $scope.addCdeMode = false;
    $scope.openCdeInNewTab = true;
    $scope.dragEnabled = true;
    $scope.classifSubEltPage = '/system/public/html/classif-sub-elements.html';
    $scope.formLocalRender = window.formLocalRender;
    $scope.formLoincRender = window.formLoincRender;
    $scope.formLoincRenderUrl = window.formLoincRenderUrl;

    $scope.tabs = {
        general: {heading: "General Details"},
        description: {heading: "Form Description"},
        naming: {heading: "Naming"},
        classification: {heading: "Classification"},
        concepts: {heading: "Concepts"},
        status: {heading: "Status"},
        referenceDocument: {heading: "Reference Documents"},
        properties: {heading: "Properties"},
        ids: {heading: "Identifiers"},
        discussions: {heading: "Discussions"},
        boards: {heading: "Boards"},
        attachments: {heading: "Attachments"},
        mlt: {heading: "More Like This"},
        history: {heading: "History"},
        forks: {heading: "Forks"}
    };

    $scope.setToAddCdeMode = function () {
        $scope.addCdeMode = true;
    };

    $scope.setToNoneAddCdeMode = function () {
        $scope.addCdeMode = false;
    };

    var route = $routeParams;

    $scope.resultPerPage = 10;

    if (route._id) var query = {formId: route._id, type: '_id'};
    if (route.tinyId) var query = {formId: route.tinyId, type: 'tinyId'};

    $scope.reload = function () {
        Form.get(query, function (form) {
            $scope.elt = form;
            if ($scope.isSiteAdmin() || window.formEditable) {
                isAllowedModel.setCanCurate($scope);
            }
            isAllowedModel.setDisplayStatusWarning($scope);
        }, function() {
            $scope.addAlert("danger", "Sorry, we are unable to retrieve this element.");
        });
        if (route.tab) {
            $scope.tabs[route.tab].active = true;
        }
    };

    $scope.reload();

    $scope.switchEditQuestionsMode = function () {
        $scope.addCdeMode = !$scope.addCdeMode;

        if ($scope.addCdeMode) {
            $scope.setToAddCdeMode();
        } else {
            $scope.setToNoneAddCdeMode();
        }
    };

    $scope.revert = function () {
        $scope.reload();
    };

    $scope.stageElt = function () {
        $scope.elt.unsaved = true;
    };

    $scope.classificationToFilter = function () {
        if ($scope.elt) {
            return $scope.elt.classification;
        }
    };

    $scope.openAddClassificationModal = function () {
        $modal.open({
            templateUrl: '/system/public/html/classifyForm.html',
            controller: 'ClassifyFormCdesModalCtrl',
            resolve: {
                userOrgs: function () {
                    return userResource.userOrgs;
                }
                , cde: function () {
                    return $scope.elt;
                }
                , addClassification: function () {
                    return {
                        addClassification: function (newClassification) {
                            var ids = [];
                            var getChildren = function (element) {
                                if (element.question && element.question.cde) {
                                    ids.push({id: element.question.cde.tinyId, version: element.question.cde.version});
                                }
                                else element.formElements.forEach(function (e) {
                                    getChildren(e);
                                });
                            };
                            getChildren($scope.elt);
                            BulkClassification.classifyTinyidList(ids, newClassification, function (res) {
                                $scope.addAlert("success", "CDEs classified!");
                            });
                        }
                    };
                }
            }
        });

    };

    $scope.updateSkipLogic = function (section) {
        if (!section.skipLogic) return;
        section.skipLogic.condition = "'" + section.skipLogic.condition1 + "' = '" + section.skipLogic.condition3 + "'";
        $scope.stageElt();
    };

    var tokenSplitter = function (str) {
        var tokens = [];
        if (!str) {
            tokens.unmatched = str;
            return tokens;
        }
        str = str.trim();
        var res = str.match(/^"([^"]+)"/);
        if (!res) {
            tokens.unmatched = str;
            return tokens;
        }
        var t = res[0];
        str = str.substring(t.length).trim();
        t = t.substring(1, t.length - 1);
        tokens.push(t);
        res = str.match(/^=/);
        if (!res) {
            tokens.unmatched = str;
            return tokens;
        }
        t = res[0];
        tokens.push(t);
        str = str.substring(t.length).trim();
        res = str.match(/^".+"/);
        if (!res) {
            tokens.unmatched = str;
            return tokens;
        }
        t = res[0];
        t = t.substring(1, t.length - 1);
        tokens.push(t);

        tokens.unmatched = str;
        return tokens;
    };

    $scope.getCurrentOptions = function (currentContent, previousQuestions, thisQuestion) {
        var filterFunc = function (e1) {
            return e1.toLowerCase().indexOf(tokens.unmatched.toLowerCase()) > -1 &&
                (!thisQuestion || e1.trim().toLowerCase().replace(/"/g, "") !== thisQuestion.label.trim().toLowerCase().replace(/"/g, ""));
        };
        var tokens = tokenSplitter(currentContent);
        if (tokens.length === 0) return $scope.languageOptions("question", previousQuestions).filter(filterFunc);
        if (tokens.length === 1) return $scope.languageOptions("operator", previousQuestions).map(function (e1) {
            return currentContent + " " + e1;
        });
        if (tokens.length === 2) return $scope.languageOptions("answer", previousQuestions, null, tokens[0]).filter(filterFunc).map(function (e1) {
            return "\"" + tokens[0] + "\" " + tokens[1] + " " + e1;
        });
    };


    $scope.languageOptions = function (languageMode, previousLevel, index, questionName) {
        if (!previousLevel) return;
        if (languageMode == 'question') return previousLevel.filter(function (q, i) {
            //Will assemble a list of questions
            if (i == index) return false; //Exclude myself            
            if (q.elementType !== "question") return false; //This element is not a question, ignore
            if (!q.question.answers || q.question.answers.length === 0) return false; //This question has no permissible answers, ignore
            return true;
        }).map(function (q) {
            return '"' + q.label + '" ';
        });
        if (languageMode == 'operator') return ["= ", "< ", "> "];
        if (languageMode == 'answer') {
            var questions = previousLevel.filter(function (q) {
                if (q.label && questionName)
                    return q.label.trim() === questionName.trim();
            });
            if (questions.length <= 0) return [];
            var question = questions[0];
            var answers = question.question.answers;
            return answers.map(function (a) {
                return '"' + a.valueMeaningName + '"';
            });
        }
        if (languageMode == 'conjuction') return ["AND", "OR"];
        return [];
    };


    $scope.pinAllCdesModal = function() {
        var modalInstance = $modal.open({
            templateUrl: '/cde/public/html/selectBoardModal.html',
            controller: 'SelectBoardModalCtrl',
            resolve: {
                boards: function () {
                    return $scope.boards;
                }
            }
        });

        modalInstance.result.then(function (selectedBoard) {
            var data = {
                board: selectedBoard,
                formTinyId: $scope.elt.tinyId
            };
            $http({method: 'post', url: '/pinFormCdes', data: data}).success(function () {
                $scope.addAlert("success", "All elements pinned.");
                $scope.loadMyBoards();
            }).error(function () {
                $scope.addAlert("danger", "Not all elements were not pinned!");
            });
        }, function () {
        });
    };

}]);