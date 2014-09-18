function FormViewCtrl($scope, $routeParams, Form, isAllowedModel) {
    $scope.module = "form";
    $scope.addCdeMode = false;
    $scope.openCdeInNewTab = true;
    $scope.dragEnabled = true;
    
    $scope.pageWidthOptions = {
        sectionAreaWidth: "col-md-12"
        , searchAreaWidth: "col-md-0"
    };
    
    $scope.setToAddCdeMode = function() {
        $scope.addCdeMode = true;
        $scope.pageWidthOptions.sectionAreaWidth = "col-md-5";
        $scope.pageWidthOptions.searchAreaWidth = "col-md-7 hidden-sm";   
    }
    
    $scope.setToNoneAddCdeMode = function() {
        $scope.addCdeMode = false;
        $scope.pageWidthOptions.sectionAreaWidth = "col-md-12";
        $scope.pageWidthOptions.searchAreaWidth = "col-md-0";   
    }
    
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