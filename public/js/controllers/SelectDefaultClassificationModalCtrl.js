function SelectDefaultClassificationModalCtrl($scope, $modalInstance, ClassificationTree, $http, orgName, defaultClassifications, addAlert) {    
    $http.get("/org/" + orgName).then(function(result) {
       $scope.org = result.data; 
    });
    
//    $scope.lastUsedClassifications = $scope.cache.get("lastUsedClassification");
//    if (!$scope.defaultClassification) {
//    }
    
    
    
    $scope.defaultClassification = { categories: [] };
    $scope.classTree = ClassificationTree;
     
    $scope.close = function () {
        $modalInstance.close();
    };

    var defaultClassificationsContains = function(param) {
        for (var i = 0; i < defaultClassifications.length; i++) {
            if (defaultClassifications[i].toString() === param.toString()) {
                return true;
            }
        }
        return false;
    };

    $scope.selectClassification = function (cat) {
        $scope.defaultClassification.categories.push(cat.name);
        if (defaultClassificationsContains($scope.defaultClassification.categories)) {
            addAlert("warning", "Already added");
        } else {
            defaultClassifications.push($scope.defaultClassification.categories.slice(0));
        }
    };   

}