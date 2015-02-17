function ClassifyFormCdesModalCtrl($scope, userOrgs, ClassificationTree, Organization, $modalInstance, addClassification) {
    $scope.classificationType = "elt";
    $scope.newClassification = { orgName: userOrgs[0], categories: [], formId: 0 };
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
            , formId: 0
        };
        deepCopy.categories.push(lastLeafName);        
        addClassification.addClassification(deepCopy);        
    };      
}