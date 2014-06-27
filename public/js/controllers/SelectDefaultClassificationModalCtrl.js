function SelectDefaultClassificationModalCtrl($scope, $modalInstance, ClassificationTree, $http, orgName, defaultClassifications, addAlert, localStorageService) {    
    $http.get("/org/" + orgName).then(function(result) {
       $scope.org = result.data; 
    });
    
    var strStore = localStorageService.get("defaultClassifications-" + orgName);
    if (strStore === null) {
        $scope.defaultClassificationsHistory = [];
    } else {
        try {
            $scope.defaultClassificationsHistory = strStore;
        } catch (e) {
            $scope.defaultClassificationsHistory = [];
            localStorageService.remove("defaultClassifications-" + orgName);
        } 
    }

    var insertToClassificationHistory = function(classification) {
        if (classificationListContains($scope.defaultClassificationsHistory, classification)) {
            return;
        }
        $scope.defaultClassificationsHistory.unshift(classification);
        if ($scope.defaultClassificationsHistory.length > 5) {
            $scope.defaultClassificationsHistory.length = 5;
        }
        localStorageService.set("defaultClassifications-" + orgName, $scope.defaultClassificationsHistory);        
    };

    $scope.defaultClassification = { categories: [] };
    $scope.classTree = ClassificationTree;
     
    $scope.close = function () {
        $modalInstance.close();
    };

    var classificationListContains = function(classificationList, classification) {
        for (var i = 0; i < classificationList.length; i++) {
            if (classificationList[i].toString() === classification.toString()) {
                return true;
            }
        }
        return false;
    };

    var insertClassification = function() {
        if (classificationListContains(defaultClassifications, $scope.defaultClassification.categories)) {
            addAlert("warning", "Already added");
        } else {
            insertToClassificationHistory($scope.defaultClassification.categories.slice(0));
            defaultClassifications.push($scope.defaultClassification.categories.slice(0));
        }        
    };

    $scope.selectPriorClassification = function(classif) {
        $scope.defaultClassification.categories = classif;
        insertClassification();
    };

    $scope.selectClassification = function (cat) {
        $scope.defaultClassification.categories.push(cat.name);
        insertClassification();
    };   

}