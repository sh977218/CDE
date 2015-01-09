function AddClassificationModalCtrl($scope, $modalInstance, ClassificationTree, Organization, ClassificationPathBuilder, myOrgs, cde, orgName, pathArray, addClassification, localStorageService) {
    $scope.viewType = {
        byClassTree : true
        , byRecentlyAdded : false
    };
    
    $scope.showByClassTreeView = function() {
        $scope.viewType.byClassTree = true;
        $scope.viewType.byRecentlyAdded = false;
    };
    
    $scope.showByRecentlyAddedView = function() {
        $scope.viewType.byClassTree = false;
        $scope.viewType.byRecentlyAdded = true;
    };
    
    $scope.myOrgs = myOrgs;
    $scope.orgName = orgName;
    $scope.path = (orgName ? $scope.path = ClassificationPathBuilder.constructPath(orgName, pathArray) : undefined);

    $scope.classTree = ClassificationTree;
    
    $scope.selectOrg = function(name) {
        if(name) {
            $scope.newClassification.orgName = name;
            ClassificationTree.wipeRest($scope.newClassification, 0);
            Organization.getByName(name, function(result) {
                 $scope.org = result.data;
            });
        } else {
            $scope.org = '';
        }
    };

    if(myOrgs && myOrgs.length===1) {
        $scope.newClassification = { orgName: myOrgs[0], categories: [], cdeId: cde._id };
        $scope.selectOrg(myOrgs[0]);
    } else if(orgName) {
        $scope.newClassification = { orgName: orgName, categories: [], cdeId: cde._id };
        $scope.selectOrg(orgName);
    } else {
        $scope.newClassification = { orgName: undefined, categories: [], cdeId: cde._id };        
    }

    $scope.close = function () {
        $modalInstance.close();
    };
    
    $scope.addClassification = function (lastLeafName) {        
        var deepCopy = {
            orgName: $scope.newClassification.orgName
            , categories: $scope.newClassification.categories.map(function(cat){return cat;})     
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
