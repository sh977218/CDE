function MergeRequestCtrl($scope, $modal, $window, MergeRequest, DataElement, MergeCdes) {
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
            if(dat.approval.fieldsRequireApproval && !dat.approval.ownDestinationCde) {
                MergeRequest.create(dat, function() {
                    if (!dat.mergeRequest.source.object.registrationState) dat.mergeRequest.source.object.registrationState = {};
                    dat.mergeRequest.source.object.registrationState.administrativeStatus = "Retire Candidate";
                    dat.mergeRequest.source.object.registrationState.replacedBy = {uuid: $scope.cdes[($scope.retiredIndex + 1) % 2].uuid};
                    DataElement.save(dat.mergeRequest.source.object, function(cde) {   
                        $window.location.href = "/#/deCompare";
                        $scope.addAlert("success", "Merge request sent");
                    });                
                });            
            } else {
                var gotoNewElement = function(mr) {
                    MergeCdes.approveMerge(mr.source.object, mr.destination.object, mr.fields, function(cde) {                                        
                        $window.location.href = "/#/deview?cdeId=" + cde._id;
                        $scope.addAlert("success", "CDEs successfully merged");
                    }); 
                };
                if (dat.approval.ownDestinationCde) {
                    $scope.showVersioning(dat.mergeRequest, function() {
                        gotoNewElement(dat.mergeRequest);
                    });
                } else {
                    gotoNewElement(dat.mergeRequest);                 
                }
            }            
        });
    };
    
    $scope.isMergeRequestPossible = function(cde, otherCde) {
        if ((!cde)||(!otherCde)) return false;
        return $scope.isAllowed(cde)
               && !(cde.registrationState.administrativeStatus === "Retire Candidate")
               && !(otherCde.registrationState.administrativeStatus === "Retire Candidate")
               && !(cde.registrationState.registrationStatus === "Standard");
    };
    
    $scope.showVersioning = function(mergeRequest, callback) {
        var modalInstance = $modal.open({
            templateUrl: 'saveCdeModalContent.html'
            , controller: MergeApproveModalCtrl
            , resolve: {
                cde: function() {
                    return mergeRequest.destination.object;
                }, user: function() {
                    return $scope.user;
                } 
            }
        });              
        modalInstance.result.then(callback);       
    };      
}
