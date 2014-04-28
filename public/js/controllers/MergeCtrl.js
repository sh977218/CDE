function MergeCtrl($scope, $modal, MergeRequest) {
    $scope.openMergeModal = function(retiredIndex) {
        $scope.retiredIndex = retiredIndex;
        var modalInstance = $modal.open({
            templateUrl: 'mergeModal.html',
            controller: MergeModalCtrl,
            resolve: {
                cdes: function() {return $scope.cdes;},
                retiredIndex: function() {return $scope.retiredIndex;},
                user: function() {return $scope.user;}
            }
        });        
        
        modalInstance.result.then(function (dat) {
            MergeRequest.create(dat);
        });
    };

}

function MergeModalCtrl($scope, $modalInstance, cdes, retiredIndex, user) {
    var source = cdes[retiredIndex];
    var target = cdes[(retiredIndex + 1) % 2];
    $scope.mergeRequest = {
        source: {uuid: source.uuid}
        , destination: {uuid: target.uuid}
        , fields: {
            ids: true
            , naming: true
            , attachments: true
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
        $modalInstance.close({mergeRequest:$scope.mergeRequest, recipient: target.stewardOrg.name, author: user.username});
    };
}
