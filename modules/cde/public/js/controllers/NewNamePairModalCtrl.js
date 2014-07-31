function NewNamePairModalCtrl($scope, $modalInstance, cde) {
    $scope.newNamePair = {
        "languageCode" : "EN-US"
        , context: {
            contextName: "Health"
            , "acceptability" : "preferred"
        }
    };
    $scope.cde = cde;
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.okCreate = function() {
        cde.naming.push($scope.newNamePair);
        cde.unsaved = true;
        $modalInstance.close();
    };
};
