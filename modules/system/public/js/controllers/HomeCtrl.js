angular.module('systemModule').controller('HomeCtrl', ['$scope', '$http', '$location', function($scope, $http, $location) {
    // Declare variables that will be used. Not needed but makes the code clear to understand.

    $scope.ftsearch = '';
    

    $scope.gotoSearch = function() {
        $scope.initCache();
        
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
}
]);