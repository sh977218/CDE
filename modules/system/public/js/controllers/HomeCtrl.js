function HomeCtrl($scope, $http, $location) {
    // Declare variables that will be used. Not needed but makes the code clear to understand.
    $scope.ALLORGS = 'All Classifications';
    $scope.orgList = [];
    $scope.selectedOrg = '';
    $scope.ftsearch = '';
    
    $scope.getOrgList = function() {
        $http.get('/listOrgsFromDEClassification').then(function(response) {
            $scope.orgList = response.data;
        });
    };

    $scope.resetSelectedOrg = function() {
        $scope.selectedOrg = '';
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
        
        if( $scope.selectedOrg !== '' ) {
            $scope.cache.put( 'search.cde.selectedOrg', $scope.selectedOrg );
        }
        $scope.cache.put( 'search.cde.ftsearch', $scope.ftsearch );

        $location.url( '/cde/search' );
    };
    
    $scope.submitForm = function( isValid ) {
        if( isValid ) {
            $scope.gotoSearch();
        } else {
            alert( 'Please correct form error(s) and resubmit.' );
        }
    };
    
    // Initialize the selectedOrg
    $scope.resetSelectedOrg();

    // Retrieves list of organizations from backend
    $scope.getOrgList();
    
}
