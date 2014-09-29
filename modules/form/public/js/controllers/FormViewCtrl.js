function FormViewCtrl($scope, $routeParams, Form, isAllowedModel) {
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
         if ($scope.elt !== null) {
             return $scope.elt.classification;
         }
    };

}