function FormViewCtrl($scope, $routeParams, Form, isAllowedModel) {
    $scope.module = "form";
    $scope.addCdeMode = true;
    $scope.openCdeInNewTab = true;
    $scope.dragEnabled = true;
    
    var route = $routeParams;
    
    if (route._id) var query = {formId: route._id, type: '_id'};
    if (route.uuid) var query = {formId: route.uuid, type: 'uuid'};

    $scope.reload = function() {
        Form.get(query, function (form) {
            $scope.elt = form;
            isAllowedModel.setCanCurate($scope);
            isAllowedModel.setDisplayStatusWarning($scope);
            isAllowedModel.setCanDoNonCuration($scope);
        });
    };
    
    $scope.reload();

    $scope.switchEditQuestionsMode = function() {
        $scope.addCdeMode = !$scope.addCdeMode;

        if($scope.addCdeMode) {
            $scope.viewOptions.sectionAreaWidth = "col-md-6";
            $scope.viewOptions.searchAreaWidth = "col-md-6";
        } else {
            $scope.viewOptions.sectionAreaWidth = "col-md-12";
            $scope.viewOptions.searchAreaWidth = "col-md-0";
        }
    };

    $scope.revert = function() {
        $scope.reload();
    };

    $scope.stageElt = function() {
        $scope.elt.unsaved = true;
    };

    $scope.viewOptions = {
        sectionAreaWidth: "col-md-6"
        , searchAreaWidth: "col-md-6"
    };

    $scope.classificationToFilter = function() {
         if ($scope.elt != null) {
             return $scope.elt.classification;
         }
    };

}