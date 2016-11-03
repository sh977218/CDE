// @TODO this many dependencies is a warning of poor design. Refac.
angular.module('systemModule').controller('AddClassificationModalCtrl',
    ['$scope', '$timeout', '$uibModalInstance', 'ClassificationTree', 'Organization', 'ClassificationPathBuilder',
        'module', 'cde', 'orgName', 'pathArray', 'addClassification', 'localStorageService', 'userResource',
        function($scope, $timeout, $modalInstance, ClassificationTree, Organization, ClassificationPathBuilder, module,
                 cde, orgName, pathArray, addClassification, localStorageService, userResource)
{

    $scope.module = module;
    $scope.myOrgs = userResource.userOrgs;
    $scope.path = (orgName ? $scope.path = ClassificationPathBuilder.constructPath(orgName, pathArray) : undefined);
    $scope.classTree = ClassificationTree;

    $scope.viewTypes = {
        "byClassTree": {
            "url": "/system/public/html/classifyCdeByClassTree.html"
        },
        "byRecentlyAdded": {
            "url": "/system/public/html/classifyCdeByRecentlyAdded.html"
        }
    };

    $scope.selectedViewType = $scope.viewTypes.byClassTree;

    $scope.showByClassTreeView = function() {
        $scope.selectedViewType = $scope.viewTypes.byClassTree;
    };
    
    $scope.showByRecentlyAddedView = function() {
        $scope.selectedViewType = $scope.viewTypes.byRecentlyAdded;
    };
    
    $scope.resetTree = function() {
        $scope.newClassification.categories = [];
    };

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
        addClassification.addClassification(deepCopy, $scope.module);
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
                if (exports.isCuratorOf(userResource.user, histStore[i].orgName)) {
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
            if (classificationList[i].orgName === classification.orgName &&
                classificationList[i].categories.toString() === classification.categories.toString()) {
                return true;
            }
        }
        return false;
    };


    // @TODO bad design. Refactor.
    if (cde === null) cde = {_id: null};
    if($scope.myOrgs && $scope.myOrgs.length===1) {
        $scope.newClassification = { orgName: $scope.myOrgs[0], categories: [], cdeId: cde._id };
        $scope.selectOrg($scope.myOrgs[0]);
    } else {
        $scope.newClassification = { orgName: undefined, categories: [], cdeId: cde._id };
    }



}
]);