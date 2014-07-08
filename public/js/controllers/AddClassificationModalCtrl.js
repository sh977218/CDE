 function AddClassificationModalCtrl($scope, $modalInstance, ClassificationTree, Organization, myOrgs, cde, addClassification, localStorageService) {
    $scope.classificationType = "cde";
    $scope.myOrgs = myOrgs; 
    $scope.newClassification = { orgName: myOrgs[0], categories: [], cdeId: cde._id };
    $scope.classTree = ClassificationTree;
    
    $scope.selectOrg = function(name) {
        ClassificationTree.wipeRest($scope.newClassification, 0);
        Organization.getByName(name, function(result) {
             $scope.org = result.data;
        });          
    };
    $scope.selectOrg($scope.newClassification.orgName);
    $scope.$watch('newClassification.orgName', function() {$scope.selectOrg($scope.newClassification.orgName);}, true);
     
    $scope.close = function () {
        $modalInstance.close();
    };
    
    $scope.addClassification = function (lastLeafName) {
        $scope.newClassification.categories.push(lastLeafName);
        var deepCopy = {
            orgName: $scope.newClassification.orgName
            , categories: $scope.newClassification.categories.map(function(cat){return cat})     
        };
        addClassification.addClassification($scope.newClassification);        
        $scope.insertToClassificationHistory(deepCopy);
    };    
    
    $scope.selectPriorClassification = function (classif) {
        addClassification.addClassification(classif);
    };
    
    
    var strStore = localStorageService.get("classificationHistory");
    if (strStore === null) {
        $scope.defaultClassificationsHistory = [];
    } else {
        try {
            $scope.defaultClassificationsHistory = strStore;
        } catch (e) {
            $scope.defaultClassificationsHistory = [];
            localStorageService.remove("classificationHistory");
        } 
    }

    $scope.insertToClassificationHistory = function(classification) {
        if ($scope.classificationListContains($scope.defaultClassificationsHistory, classification)) {
            return;
        }
        $scope.defaultClassificationsHistory.unshift(classification);
        if ($scope.defaultClassificationsHistory.length > 5) {
            $scope.defaultClassificationsHistory.length = 5;
        }
        localStorageService.set("classificationHistory", $scope.defaultClassificationsHistory);        
    };  
    
    $scope.classificationListContains = function(classificationList, classification) {
        for (var i = 0; i < classificationList.length; i++) {
            if (classificationList[i].orgName === classification.orgName && classificationList[i].categories.toString() === classification.categories.toString()) {
                return true;
            }
        }
        return false;
    };    
    
    
}
