function FormViewCtrl($scope, $routeParams, $http, Form, isAllowedModel) {
    $scope.module = "form";
    $scope.baseLink = '#/formView?_id=';
    $scope.addCdeMode = false;
    $scope.openCdeInNewTab = true;
    $scope.dragEnabled = true;
    
    $scope.tabs = {
        general: {heading: "General Details"},
        description: {heading: "Form Description"},
        classification: {heading: "Classification"},
        concepts: {heading: "Concepts"},
        status: {heading: "Status"},
        properties: {heading: "Properties"},
        ids: {heading: "Identifiers"},
        discussions: {heading: "Discussions"},
        boards: {heading: "Boards"},
        attachments: {heading: "Attachments"},
        mlt: {heading: "More Like This"},
        history: {heading: "History"},
        forks: {heading: "Forks"}
    };
    
    $scope.setToAddCdeMode = function() {
        $scope.addCdeMode = true;
    };
    
    $scope.setToNoneAddCdeMode = function() {
        $scope.addCdeMode = false;
    };
    
    var route = $routeParams;
    
    $scope.resultPerPage = 10;
    
    if (route._id) var query = {formId: route._id, type: '_id'};
    if (route.tinyId) var query = {formId: route.tinyId, type: 'tinyId'};

    $scope.reload = function() {
        Form.get(query, function (form) {
            $scope.elt = form;
            isAllowedModel.setCanCurate($scope);
            isAllowedModel.setDisplayStatusWarning($scope);
            isAllowedModel.setCanDoNonCuration($scope);
            $scope.checkForArchivedCdes();
        });
        if (route.tab) {
            $scope.tabs[route.tab].active = true;
        }
    };
    
    $scope.reload();

    $scope.switchEditQuestionsMode = function() {
        $scope.addCdeMode = !$scope.addCdeMode;

        if($scope.addCdeMode) {
            $scope.setToAddCdeMode();
        } else {
            $scope.setToNoneAddCdeMode();
        }
    };

    $scope.revert = function() {
        $scope.reload();
    };

    $scope.stageElt = function() {
        $scope.elt.unsaved = true;
    };

    $scope.classificationToFilter = function() {
         if ($scope.elt) {
             return $scope.elt.classification;
         }
    };
    
    $scope.checkForArchivedCdes = function() {
        var checkArray = [];
        var findAllCdesInFormElement = function(node) {
            if (node.formElements) {
                for (var i = 0; i < node.formElements.length; i++) {
                    if (node.formElements[i].elementType === "question") {
                        checkArray.push({tinyId: node.formElements[i].question.cde.tinyId, version: node.formElements[i].question.cde.version});
                    }
                    findAllCdesInFormElement(node.formElements[i]);
                }
            }
        };
        findAllCdesInFormElement($scope.elt);
        
        var applyOutdatedElements = function(node, outdatedElements) {
            if (node.formElements) {
                for (var i = 0; i < node.formElements.length; i++) {
                    if (node.formElements[i].elementType === "question") {
                        if (outdatedElements.indexOf(node.formElements[i].question.cde.tinyId + "v" + node.formElements[i].question.cde.version) > -1) {
                            node.formElements[i].question.cde.outdated = true;
                        }
                    }
                    applyOutdatedElements(node.formElements[i], outdatedElements);
                }
            }
        };    
        
        $http.get("/archivedCdes/" + JSON.stringify(checkArray)).then(function(result) {
            if (result.data.length > 0) {
                $scope.elt.outdated = true;
                var outdatedElements = [];
                result.data.forEach(function(e) {
                    outdatedElements.push(e.tinyId + "v" + e.version);
                });
                applyOutdatedElements($scope.elt, outdatedElements);
            }
        });
    };
    
    $scope.typeAheadSelect = function(condition, $item) {
        if ($scope.languageMode == 'question') return $scope.languageMode = 'operator';
        if ($scope.languageMode == 'operator') return $scope.languageMode = 'answer';
        if ($scope.languageMode == 'answer') return $scope.languageMode = 'conjuction';
        if ($scope.languageMode == 'conjuction') return $scope.languageMode = 'question';
    };
    
    $scope.languageOptions = function(previousLevel) {
        if ($scope.languageMode == 'question') return previousLevel.filter(function(q){return q.elementType === "question";}).map(function(q){return q.label;});
        if ($scope.languageMode == 'operator') return ["=", "<", ">"];
        if ($scope.languageMode == 'answer') return ["Answer1", "Answer2", "Answer3"];
        if ($scope.languageMode == 'conjuction') return ["AND", "OR"];
    };
    
    $scope.languageMode = 'question'; // question, operator, answer, conjuction
}