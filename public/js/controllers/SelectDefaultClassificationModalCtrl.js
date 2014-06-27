function SelectDefaultClassificationModalCtrl($scope, $modalInstance, ClassificationTree, $http, orgName, defaultClassifications, addAlert, localStorageService) {    
    $http.get("/org/" + orgName).then(function(result) {
       $scope.org = result.data; 
    });
    
    var strStore = JSON.stringify(localStorageService.get("defaultClassifications-" + orgName));
    if (strStore === null) {
        $scope.defaultClassificationsHistory = [];
    } else {
        console.log(strStore);
        try {
            $scope.defaultClassificationsHistory = JSON.parse(strStore);
        } catch (e) {
            $scope.defaultClassificationsHistory = [];
            localStorageService.remove("defaultClassifications-" + orgName);
        } 
    }

//    $scope.$watch('defaultClassificationsHistory', function() {
//        localStorageService.set("defaultClassifications-" + orgName, JSON.stringify($scope.defaultClassificationsHistory));   
//    });
//    
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
            $scope.defaultClassificationsHistory.push($scope.defaultClassification.categories.slice(0));
            console.log("before:" + JSON.stringify($scope.defaultClassificationsHistory));
            localStorageService.set("defaultClassifications-" + orgName, JSON.stringify($scope.defaultClassificationsHistory));
            console.log("after: " + JSON.stringify(localStorageService.get("defaultClassifications-" + orgName)));
        }
    };   

}