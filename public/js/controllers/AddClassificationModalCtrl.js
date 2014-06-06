 function AddClassificationModalCtrl($scope, $modalInstance, ClassificationTree, Organization, CdeClassification, myOrgs, cde, addAlert) {
    $scope.classificationType = "cde";
    $scope.myOrgs = myOrgs; 
    $scope.newClassification = { orgName: myOrgs[0], categories: [], cde: cde };
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
    
    $scope.addClassification = function (lastLeafName, event) {
        $scope.newClassification.categories.push(lastLeafName);
        CdeClassification.save($scope.newClassification, function() {
            addAlert("success", "Classification Added");
            $scope.newClassification.categories.pop();
        });
        
        //$scope.classTree.
        //$modalInstance.close($scope.newClassification);
    };    
}
