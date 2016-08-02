angular.module('cdeModule').controller('CdeCopyModalCtrl',
    ['$scope', 'elt', 'userResource', '$controller', '$uibModalInstance',
        function($scope, elt, userResource, $controller, $modalInstance) {
    elt.classification = [];
    delete elt.tinyId;
    delete elt._id;
    //
    //delete elt.source;
    //delete elt.sourceId;
    //delete elt.origin;
    //delete elt.created;
    //
    //delete elt.updated;
    //delete elt.imported;
    //delete elt.updatedBy;
    //delete elt.createdBy;
    //delete elt.version;
    //
    //delete elt.history;
    //delete elt.changeNote;
    //delete elt.comments;
    //
    //delete elt.forkOf;
    //delete elt.views;

    elt.ids = [];
    elt.registrationState.registrationStatus = "Incomplete";
    elt.registrationState.administrativeNote = "Copy of: " + $scope.elt.naming[0].designation;
    delete elt.registrationState.administrativeStatus;
    $scope.elt = JSON.parse(JSON.stringify(elt));
    $scope.origName = $scope.elt.naming[0].designation;
    $scope.elt.naming[0].designation = "Copy of: " + $scope.elt.naming[0].designation;
    $scope.myOrgs = userResource.userOrgs;
    $controller('CreateCdeAbstractCtrl', {$scope: $scope});

    $scope.saveCopy = function(){
        $scope.save();
        $modalInstance.close();
    };

    $scope.cancelCopy = function(){
        $modalInstance.close();
    };

    $scope.isNameNew = function(){
        return $scope.origName !== $scope.elt.naming[0].designation;
    };

}]);