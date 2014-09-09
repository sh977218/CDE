 function AddClassificationModalCtrl($scope, $modalInstance, ClassificationTree, Organization, myOrgs, cde, addClassification, localStorageService) {
    $scope.classificationType = "elt";
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
        var deepCopy = {
            orgName: $scope.newClassification.orgName
            , categories: $scope.newClassification.categories.map(function(cat){return cat})     
            , cdeId: cde._id
        };
        deepCopy.categories.push(lastLeafName);        
        addClassification.addClassification(deepCopy);        
        $scope.insertToClassificationHistory(deepCopy);
    };     
    
    $scope.selectPriorClassification = function (classif) {
        classif.cdeId = cde._id; 
        addClassification.addClassification(classif);
    };
    
    $scope.defaultClassificationsHistory = [];
    var histStore = localStorageService.get("classificationHistory");
    if (histStore !== null) {
        try {
            for (var i = 0; i < histStore.length; i++) {
                if ($scope.myOrgs.indexOf(histStore[i].orgName) > -1) {
                    $scope.defaultClassificationsHistory.push(histStore[i]);
                }
            }
        } catch (e) {
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
