function MergeModalCtrl($scope, $modalInstance, cdes, retiredIndex, user) {
    $scope.source = cdes[retiredIndex];
    $scope.target = cdes[(retiredIndex + 1) % 2];
    $scope.mergeRequest = {
        source: {uuid: $scope.source.uuid, object: $scope.source}
        , destination: {uuid: $scope.target.uuid, object: $scope.target}
        , mergeFields: {
            classifications: true
            , ids: false
            , naming: false
            , properties: false            
            , attachments: false
        }
        , states: [{
            action: "Filed"
            , date: new Date()
            , comment: "cmnt"
        }]
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };  
    $scope.sendMergeRequest = function() {
        $modalInstance.close({mergeRequest:$scope.mergeRequest, recipient: $scope.target.stewardOrg.name, author: user.username, approval: $scope.approvalNecessary()});
    };
    $scope.showApprovalAlert = function() {
        return $scope.approvalNecessary().fieldsRequireApproval && !$scope.approvalNecessary().ownDestinationCde;
    };
    $scope.approvalNecessary = function() {
        return {
            fieldsRequireApproval: $scope.mergeRequest.fields.ids || $scope.mergeRequest.fields.naming || $scope.mergeRequest.fields.properties || $scope.mergeRequest.fields.attachments,
            ownDestinationCde: user.orgAdmin.concat(user.orgCurator).indexOf($scope.mergeRequest.destination.object.stewardOrg.name)>-1 
        };
    };
}
