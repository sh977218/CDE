angular.module('systemModule').controller('HomeCtrl', ['$scope', '$http', '$location','AutoCompleteResource', function($scope, $http, $location,AutoCompleteResource) {
    // Declare variables that will be used. Not needed but makes the code clear to understand.

    $scope.search = function () {
        $scope.currentSearchTerm = $scope.ftsearch;
        $scope.cache.put($scope.getCacheName("ftsearch"), $scope.ftsearch);

        $scope.reload();
    };

    $scope.ftsearch = '';

    $scope.getAutoComplete = function (searchTerm) {
        return AutoCompleteResource.getAutoComplete(searchTerm);
    }

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