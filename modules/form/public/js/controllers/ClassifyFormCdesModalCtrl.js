function ClassifyFormCdesModalCtrl($scope, myOrgs, ClassificationTree, Organization, $modalInstance, module, addClassification) {
    $scope.classificationType = "elt";
    $scope.myOrgs = myOrgs; 
    $scope.module = module; 
    $scope.newClassification = { orgName: myOrgs[0], categories: [], formId: 0 };
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