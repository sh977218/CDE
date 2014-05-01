function MergeModalCtrl($scope, $modalInstance, cdes, retiredIndex, user) {
    $scope.source = cdes[retiredIndex];
    $scope.target = cdes[(retiredIndex + 1) % 2];
    $scope.mergeRequest = {
        source: {uuid: $scope.source.uuid}
        , destination: {uuid: $scope.target.uuid}
        , fields: {
            ids: false
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
        $modalInstance.close({mergeRequest:$scope.mergeRequest, recipient: $scope.target.stewardOrg.name, author: user.username});
    };
}
