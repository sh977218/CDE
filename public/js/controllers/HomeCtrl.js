function HomeCtrl($scope, $http, $location) {
    $scope.setActiveMenu('HOME');
    
    $scope.orgList = [];
    $scope.selectedOrg = "";
    $scope.ftsearch = "";
    
    
    $scope.getOrgList = function() {
        $http.get("/listorgs").then(function(response) {
            $scope.orgList = response.data;
        });
    };

    $scope.resetSelectedOrg = function() {
        $scope.selectedOrg = "All Organizations";
    };
    
    $scope.updateSelectedOrg = function( neworg ) {
        $scope.selectedOrg = neworg;
    };
    
    $scope.clearSearch = function() {
        delete $scope.ftsearch;
        $scope.resetSelectedOrg();
    };
    
    $scope.gotoSearch = function() {
        $scope.initCache();
        
        if( $scope.selectedOrg !== "All Organizations" ) {
            $scope.cache.put( "selectedOrg", $scope.selectedOrg );
        }
        $scope.cache.put( "ftsearch", $scope.ftsearch );

        $location.url("search");
    };
    
    $scope.submitForm = function( isValid ) {
        if( isValid ) {
            $scope.gotoSearch();
        } else {
            alert( "Please correct form error(s) and resubmit." );
        }
    };
    
    // Initialize the selectedOrg
    $scope.resetSelectedOrg();

    // Retrieves list of organizations from backend
    $scope.getOrgList();
    

}
